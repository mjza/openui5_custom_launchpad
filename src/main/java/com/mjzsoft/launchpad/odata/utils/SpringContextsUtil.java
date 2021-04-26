package com.mjzsoft.launchpad.odata.utils;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.*;

import javax.persistence.Column;
import javax.persistence.EntityManager;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.metamodel.EntityType;

import org.apache.olingo.odata2.api.exception.MessageReference;
import org.apache.olingo.odata2.api.exception.ODataBadRequestException;
import org.apache.olingo.odata2.api.exception.ODataException;
import org.apache.olingo.odata2.api.exception.ODataInternalServerErrorException;
import org.apache.olingo.odata2.api.exception.ODataNotFoundException;
import org.apache.olingo.odata2.api.exception.ODataNotImplementedException;
import org.apache.olingo.odata2.jpa.processor.api.ODataJPAContext;
import org.apache.olingo.odata2.jpa.processor.api.access.JPAEdmMappingModelAccess;
import org.apache.olingo.odata2.jpa.processor.api.factory.ODataJPAFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.repository.support.Repositories;
import org.springframework.stereotype.Component;

import com.mjzsoft.launchpad.odata.model.jwt.CustomUserDetails;
import com.mjzsoft.launchpad.odata.model.jwt.Permission;
import com.mjzsoft.launchpad.odata.model.jwt.Role;
import com.mjzsoft.launchpad.odata.repository.BaseRepository;
import com.mjzsoft.launchpad.odata.repository.jwt.PermissionRepository;
import com.mjzsoft.launchpad.odata.service.BaseService;

/**
 * NOTE: This Class should only be used in those Object not managed by SIC
 */

@Component
public class SpringContextsUtil implements ApplicationContextAware {
	final static Logger logger = LoggerFactory.getLogger(SpringContextsUtil.class);

	private static ApplicationContext applicationContext;

	private static Repositories repositories;

	private static List<BaseService<?>> baseServices;

	private static List<BaseRepository<?, ?>> baseRepositories;

	private static EntityManager entityManager;

	private static PermissionRepository permissionRepository;

	public SpringContextsUtil(EntityManager entityManager, List<BaseService<?>> baseServices,
			List<BaseRepository<?, ?>> baseRepositories, PermissionRepository permissionRepository) {

		SpringContextsUtil.entityManager = entityManager;

		SpringContextsUtil.baseServices = baseServices;

		Collections.sort(baseRepositories, (r1, r2) -> {
			return r1.sequence() - r2.sequence();
		});
		SpringContextsUtil.baseRepositories = baseRepositories;

		SpringContextsUtil.permissionRepository = permissionRepository;

		logger.debug("Loading SpringContextsUtil");
	}

	public static void userAllowed(CustomUserDetails currentUser, String crud, String entitySetName)
			throws ODataException {
		// PermissionRepository permissionRepository = (PermissionRepository)
		// SpringContextsUtil.getRepository(new Permission());
		Set<Role> roles = currentUser.getRoles();
		boolean isAllowed = false;
		Iterator<Role> it = roles.iterator();
		Role role;
		Optional<Permission> permisions = null;
		// Check permissions for all roles
		while (!isAllowed && it.hasNext()) {
			role = it.next();
			permisions = null;
			if (crud.equals("Create")) {
				permisions = SpringContextsUtil.permissionRepository.findByRoleAndSetNameAndCreateAllowed(role,
						entitySetName, true);
			} else if(crud.equals("Read")) {
				permisions = SpringContextsUtil.permissionRepository.findByRoleAndSetNameAndReadAllowed(role,
						entitySetName, true);
			} else if(crud.equals("Update")) {
				permisions = SpringContextsUtil.permissionRepository.findByRoleAndSetNameAndUpdateAllowed(role,
						entitySetName, true);
			} else if(crud.equals("Delete")) {
				permisions = SpringContextsUtil.permissionRepository.findByRoleAndSetNameAndDeleteAllowed(role,
						entitySetName, true);
			}
			// check the permission for this role
			if (permisions != null && permisions.isPresent()) {
				isAllowed = true;
			}
		}
		if (!isAllowed) {
			logger.info("Odata request rejected as user '" + currentUser.getUsername() + "' is not allowed to do " + crud + " on " + entitySetName);
			Locale locale = LocaleContextHolder.getLocale();
			String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorNotAllowedAction");
			throw new ODataException(pattern);
		}
	}

	@Override
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		logger.debug("Inject ApplicationContext: {} into SpringContextsUtil", applicationContext);
		SpringContextsUtil.applicationContext = applicationContext;
		SpringContextsUtil.repositories = new Repositories(applicationContext);
	}

	public static List<BaseRepository<?, ?>> getRepositories() {
		List<BaseRepository<?, ?>> allRepositories = new ArrayList<BaseRepository<?, ?>>();
		Iterator<Class<?>> it = repositories.iterator();
		while (it.hasNext()) {
			Class<?> domainClass = (Class<?>) it.next();
			BaseRepository<?, ?> repository = (BaseRepository<?, ?>) repositories.getRepositoryFor(domainClass).get();
			allRepositories.add(repository);
		}
		return allRepositories;
	}
	
	public static BaseRepository<?, ?> getRepository(Class<?> entityClass) {
		BaseRepository<?, ?> repository = (BaseRepository<?, ?>) repositories.getRepositoryFor(entityClass).get();
		return repository;
	}

	public static BaseRepository<?, ?> getRepository(Object entity) {
		BaseRepository<?, ?> repository = (BaseRepository<?, ?>) repositories.getRepositoryFor(entity.getClass()).get();
		return repository;
	}

	public static final Set<EntityType<?>> getEntities() {
		return entityManager.getMetamodel().getEntities();
	}

	public static final List<BaseService<?>> getBaseServices() {
		return baseServices;
	}

	public static final List<BaseRepository<?, ?>> getBaseRepositories() {
		return baseRepositories;
	}

	public static ApplicationContext getApplicationContext() {
		return applicationContext;
	}

	public static Object getBean(String name) throws BeansException {
		return applicationContext.getBean(name);
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static Object getBean(String name, Class requiredType) throws BeansException {
		return applicationContext.getBean(name, requiredType);
	}

	public static boolean containsBean(String name) {
		return applicationContext.containsBean(name);
	}

	public static boolean isSingleton(String name) throws NoSuchBeanDefinitionException {
		return applicationContext.isSingleton(name);
	}

	@SuppressWarnings("rawtypes")
	public static Class getType(String name) throws NoSuchBeanDefinitionException {
		return applicationContext.getType(name);
	}

	public static String[] getAliases(String name) throws NoSuchBeanDefinitionException {
		return applicationContext.getAliases(name);
	}

	public static boolean isEntity(Class<?> clazz) {
		boolean foundEntity = false;
		Set<EntityType<?>> entities = SpringContextsUtil.getEntities();
		for (EntityType<?> entityType : entities) {
			Class<?> entityClass = entityType.getJavaType();
			if (entityClass.equals(clazz)) {
				foundEntity = true;
			}
		}
		return foundEntity;
	}

	private static JPAEdmMappingModelAccess getJPAEdmMappingModelAccess(ODataJPAContext oDataJPAContext) {
		// Load the mapping file
		JPAEdmMappingModelAccess jpaEdmMappingModelAccess = null;
		jpaEdmMappingModelAccess = ODataJPAFactory.createFactory().getJPAAccessFactory()
				.getJPAEdmMappingModelAccess(oDataJPAContext);
		if (jpaEdmMappingModelAccess.isMappingModelExists()) {
			jpaEdmMappingModelAccess.loadMappingModel();
		}
		return jpaEdmMappingModelAccess;
	}

	public static void fetchColumnsType(ODataJPAContext oDataJPAContext, Class<?> type,
			Map<String, Class<?>> columnsType) {
		// Load the mapping file
		JPAEdmMappingModelAccess jpaEdmMappingModelAccess = SpringContextsUtil
				.getJPAEdmMappingModelAccess(oDataJPAContext);
		// Extract list of columns and their types from repository
		String jpaEntityTypeName = type.getSimpleName();
		String jpaAttributeName, mappedName;
		Inflector inflector = new Inflector();
		for (Field field : type.getDeclaredFields()) {
			jpaAttributeName = field.getName();
			mappedName = jpaEdmMappingModelAccess.mapJPAAttribute(jpaEntityTypeName, jpaAttributeName);
			if (mappedName == null) {
				mappedName = inflector.upperCamelCase(jpaAttributeName);
			}
			// Only if it is a column must be inserted
			if (field.isAnnotationPresent(Id.class)) {
				columnsType.put(mappedName, Id.class);
			} else if (field.isAnnotationPresent(Column.class)) {
				columnsType.put(mappedName, Column.class);
			} else if (field.isAnnotationPresent(JoinColumn.class)) {
				columnsType.put(mappedName, JoinColumn.class);
			}
		}
	}

	private static void fetchColumnsMap(ODataJPAContext oDataJPAContext, Class<?> type,
			Map<String, String> columnsMap) {
		// Load the mapping file
		JPAEdmMappingModelAccess jpaEdmMappingModelAccess = SpringContextsUtil
				.getJPAEdmMappingModelAccess(oDataJPAContext);
		// Extract list of columns and their types from repository
		String jpaEntityTypeName = type.getSimpleName();
		String jpaAttributeName, mappedName;
		Inflector inflector = new Inflector();
		for (Field field : type.getDeclaredFields()) {
			jpaAttributeName = field.getName();
			mappedName = jpaEdmMappingModelAccess.mapJPAAttribute(jpaEntityTypeName, jpaAttributeName);
			if (mappedName == null) {
				mappedName = inflector.upperCamelCase(jpaAttributeName);
			}
			// Only if it is a column must be inserted
			if (field.isAnnotationPresent(Id.class)) {
				columnsMap.put(mappedName, jpaAttributeName);
			} else if (field.isAnnotationPresent(Column.class)) {
				columnsMap.put(mappedName, jpaAttributeName);
			} else if (field.isAnnotationPresent(JoinColumn.class)) {
				columnsMap.put(mappedName, jpaAttributeName);
			}
		}
	}

	public static void updateObject(ODataJPAContext oDataJPAContext, Class<?> type, Object object,
			Map<String, Object> data) throws ODataBadRequestException, ODataInternalServerErrorException,
			NoSuchFieldException, SecurityException, ClassNotFoundException, NoSuchMethodException,
			IllegalAccessException, IllegalArgumentException, InvocationTargetException, InstantiationException {
		Map<String, String> columnsMap = new HashMap<>();
		SpringContextsUtil.fetchColumnsMap(oDataJPAContext, type, columnsMap);
		// Load the services
		List<BaseService<?>> services = SpringContextsUtil.getBaseServices();
		// Iterate over received data and store them in object!
		for (Map.Entry<String, Object> entry : data.entrySet()) {
			Object value = entry.getValue();
			String attributeKey = entry.getKey();
			String column = columnsMap.get(attributeKey);
			SpringContextsUtil.updateColumn(type, object, column, value, services);
		} // end of mapping
	}

	public static void updateColumn(Class<?> type, Object object, String column, Object value,
			List<BaseService<?>> services) throws NoSuchFieldException, SecurityException, ODataBadRequestException,
			ODataInternalServerErrorException, ClassNotFoundException, NoSuchMethodException, IllegalAccessException,
			IllegalArgumentException, InvocationTargetException, InstantiationException {
		Inflector inflector = new Inflector();
		String methodName = "";
		boolean nullValueAllowed = true;
		Type columnType = type.getDeclaredField(column).getGenericType();
		if (columnType instanceof ParameterizedType) {
			ParameterizedType parameterizedType = (ParameterizedType) columnType;
			columnType = parameterizedType.getActualTypeArguments()[0];
			methodName = "add" + inflector.upperCamelCase(inflector.singularize(column));
			nullValueAllowed = false;
		} else {
			methodName = "set" + inflector.upperCamelCase(column);
		}

		Class<?> columnClass = null;
		Class<?> convertorClass = null;
		Class<?> argClass = String.class;

		boolean convert = value.getClass().getName().equals("java.lang.String") ? true : false;
		// If it's foreign key then find the related object
		if (SpringContextsUtil.isEntity((Class<?>) columnType)) {
			convert = false;
			boolean serviceFound = false;
			// if the FK isn't passed, maybe it is optional
			if (value == null || value.toString().trim().isEmpty()) {
				serviceFound = true;
				value = null;
			}
			// if the FK is passed then it must be exist!
			for (int j = 0; j < services.size() && !serviceFound; j++) {
				BaseService<?> service = services.get(j);
				if (service.getType().equals(columnType)) {
					serviceFound = true;
					Optional<?> val = service.findById(value.toString());
					if (val.isPresent()) {
						value = val.get();
					} else {
						// if the FK does not exist!
						MessageReference msgRef = ODataNotFoundException.ENTITY.create();
						msgRef.addContent("There is no object for passed foreign key id: {" + value
								+ "} for the property {" + column + "}.");
						throw new ODataBadRequestException(msgRef);
					}
				}
			}
			if (!serviceFound) {
				MessageReference msgRef = ODataNotImplementedException.COMMON.create();
				msgRef.addContent("The service class does not exist for " + columnType.getTypeName() + " entity.");
				throw new ODataInternalServerErrorException(msgRef);
			}
		}
		// Find the suitable class and function for conversion
		if (columnType.getTypeName().equals("byte")) {
			columnClass = byte.class;
			convertorClass = Byte.class;
			if (value instanceof String) {
				if (((String) value).compareToIgnoreCase("TRUE") == 0
						|| ((String) value).compareToIgnoreCase("1") == 0) {
					value = convert ? "1" : 1;
				} else if (((String) value).compareToIgnoreCase("FALSE") == 0
						|| ((String) value).compareToIgnoreCase("0") == 0) {
					value = convert ? "0" : 0;
				}
			}
		} else if (columnType.getTypeName().equals("short")) {
			columnClass = short.class;
			convertorClass = Short.class;
		} else if (columnType.getTypeName().equals("int")) {
			columnClass = int.class;
			convertorClass = Integer.class;
		} else if (columnType.getTypeName().equals("long")) {
			columnClass = long.class;
			convertorClass = Long.class;
		} else if (columnType.getTypeName().equals("float")) {
			columnClass = float.class;
			convertorClass = Float.class;
		} else if (columnType.getTypeName().equals("double")) {
			columnClass = double.class;
			convertorClass = Double.class;
		} else if (columnType.getTypeName().equals("char")) {
			columnClass = char.class;
			convertorClass = Character.class;
		} else if (columnType.getTypeName().equals("boolean")) {
			columnClass = boolean.class;
			convertorClass = Boolean.class;
			if (value instanceof String) {
				convert = false;
				if (((String) value).compareToIgnoreCase("TRUE") == 0
						|| ((String) value).compareToIgnoreCase("1") == 0) {
					value = convert ? "true" : true;
				} else if (((String) value).compareToIgnoreCase("FALSE") == 0
						|| ((String) value).compareToIgnoreCase("0") == 0) {
					value = convert ? "false" : false;
				}
			}
		} else if (columnType.getTypeName().equals("byte[]")) {
			convert = false;
			columnClass = byte[].class;
			value = value.toString().isEmpty() ? null : value.toString().getBytes();
		} else {
			columnClass = Class.forName(columnType.getTypeName());
			convertorClass = columnClass;
			if (value == null || value.toString().isEmpty()) {
				if (!nullValueAllowed) {
					return; // ignore the value in this case!
				}
				value = null;
				convert = false;
			} else if (columnType.getTypeName().equals(value.getClass().getName())) {
				convert = false;
			} else if (columnType.getTypeName().equals("java.sql.Timestamp")
					&& value.getClass().getName().equals("java.util.GregorianCalendar")) {
				long lv = ((GregorianCalendar) value).getTimeInMillis();
				value = lv > 2147483647000L ? 2147483647000L : lv;
				argClass = long.class;
				convert = true;
			} else if (columnType.getTypeName().equals("java.sql.Timestamp") && !value.toString().isEmpty()) {
				long lv = Long.parseUnsignedLong(value.toString());
				value = lv > 2147483647000L ? 2147483647000L : lv;
				argClass = long.class;
				convert = true;
			} else if (columnType.getTypeName().equals("java.util.Date")
					&& value.getClass().getName().equals("java.util.GregorianCalendar")) {
				long lv = ((GregorianCalendar) value).getTimeInMillis();
				value = lv > 253402300799000L ? 253402300799000L : lv;
				argClass = long.class;
				convert = true;
			} else if (columnType.getTypeName().equals("java.util.Date") && !value.toString().isEmpty()) {
				long lv = Long.parseUnsignedLong(value.toString());
				value = lv > 253402300799000L ? 253402300799000L : lv;
				argClass = long.class;
				convert = true;
			} else if (columnType.getTypeName().equals("java.util.Calendar")
					&& value.getClass().getName().equals("java.util.GregorianCalendar")) {
				long lv = ((GregorianCalendar) value).getTimeInMillis();
				lv = lv > 253402300799000L ? 253402300799000L : lv;
				Calendar calendar = Calendar.getInstance();
				calendar.setTimeInMillis(lv);
				value = calendar;
				argClass = Calendar.class;
				convert = false;
			} else if (columnType.getTypeName().equals("java.util.Calendar") && !value.toString().isEmpty()) {
				long lv = Long.parseUnsignedLong(value.toString());
				lv = lv > 253402300799000L ? 253402300799000L : lv;
				Calendar calendar = Calendar.getInstance();
				calendar.setTimeInMillis(lv);
				value = calendar;
				argClass = Calendar.class;
				convert = false;
			}
		}
		Method method = object.getClass().getMethod(methodName, columnClass);
		// When it is entity we don't need conversion!
		if (convertorClass.isEnum()) {
			method.invoke(object,
					convert ? convertorClass.getMethod("valueOf", String.class).invoke(convertorClass, value) : value);
		} else {
			method.invoke(object, convert ? convertorClass.getDeclaredConstructor(argClass).newInstance(value) : value);
		}
	}

	public static void updateDataMap(ODataJPAContext oDataJPAContext, Class<?> type, Object persisted,
			Map<String, Object> data) throws NoSuchMethodException, SecurityException, IllegalAccessException,
			IllegalArgumentException, InvocationTargetException {
		// Extract list of columns and their types from repository
		Map<String, Class<?>> columnsType = new HashMap<>();
		SpringContextsUtil.fetchColumnsType(oDataJPAContext, type, columnsType);
		Inflector inflector = new Inflector();
		// update rest of the properties
		for (Map.Entry<String, Class<?>> entry : columnsType.entrySet()) {
			if (entry.getValue() != JoinColumn.class) {
				String column = inflector.upperCamelCase(entry.getKey());
				Method method = persisted.getClass().getMethod("get" + column);
				Object val = method.invoke(persisted);
				data.put(column, val);
			}
		}
	}

}