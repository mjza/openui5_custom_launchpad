package com.mjzsoft.launchpad.odata;
/**
 * Runner class is responsible for checking the database tables and if they are empty feeds them based on {Entity}.csv files inside the `resources\mockdata\` directory.  
 */

import com.opencsv.CSVReader;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Constructor;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

import com.mjzsoft.launchpad.odata.utils.ODataContextUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import com.mjzsoft.launchpad.odata.repository.BaseRepository;
import com.mjzsoft.launchpad.odata.service.BaseService;
import com.mjzsoft.launchpad.odata.utils.SpringContextsUtil;

@Component
public class Runner implements CommandLineRunner {

	public static final String COMMA_DELIMITER = ",";
	private static final Logger logger = LoggerFactory.getLogger(Runner.class);

	private List<BaseService<?>> services;
	private List<BaseRepository<?, ?>> repositories;

	@Autowired
	public Runner(List<BaseService<?>> services, List<BaseRepository<?, ?>> repositories) {

		this.services = services;
		
		// sort the repositories based on their sequences
		// the sequences are representing the foreign keys dependencies between models 
		// As much as the sequence value is lower, the equivalent model must be fed first. 
		Collections.sort(repositories, (r1, r2) -> {
			return r1.sequence() - r2.sequence();
		});
		
		this.repositories = repositories;
	}

	@Override
	public void run(String... args) throws Exception {
		for (@SuppressWarnings("rawtypes")
		BaseRepository repo : repositories) {
			this.fillRepository(repo);
		}
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private void fillRepository(BaseRepository repository) {
		// checks if the table is empty then
		if (repository.count() == 0) {
			// get the related model for that repository
			Class type = repository.getType();
			// if type is not set in the child repository then return 
			if (type == null)
				return;
			// try to find the csv file related to the entity model 
			String entityName = type.getSimpleName();
			logger.info(entityName + " table in Database is still empty. Adding some sample records from csv file.");
			try {
				InputStream inputStream = getClass().getClassLoader()
						.getResourceAsStream("mockdata/" + entityName + ".csv");
				// if it fails to find the csv file will throw an exception 
				if (inputStream == null) {
					logger.warn("Couldn't find `" + entityName + ".csv` file in the `/resources/mockdata/` folder!");
					Locale locale = LocaleContextHolder.getLocale();
					String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorFileNotFound");
					String message = MessageFormat.format(pattern, entityName);
					throw new IllegalArgumentException(message);
				}
				
				// otherwise starts to read the csv values and fill the entity 
				InputStreamReader streamReader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
				BufferedReader bufferedReader = new BufferedReader(streamReader);
				CSVReader csvReader = new CSVReader(bufferedReader);
				String[] line;
				boolean firstLine = true;
				List<String> columns = null;
				while ((line = csvReader.readNext()) != null) {
					String[] values = line;
					// skip the first line as it is columns name!
					if (firstLine) {
						firstLine = false;
						columns = Arrays.asList(values);
						continue;
					}
					// from the second line of the csv file
					try {
						// make an entity
						Constructor<?> constructor = type.getConstructor();
						Object object = constructor.newInstance();
						// for each value in the line call the `SpringContextsUtil.updateColumn` static function
						// to fill the property 
						for (int i = 0; i < values.length && i < columns.size(); i++) {
							String column = columns.get(i);
							Object value = values[i];
							SpringContextsUtil.updateColumn(type, object, column, value, services);
						}
						// commit the changes to DB
						repository.save(object);
					} catch (Exception e) {
						e.printStackTrace();
						logger.error("Line " + Thread.currentThread().getStackTrace()[1].getLineNumber() + ": "
								+ e.toString());
						break;
					}
				}
				// close the CSV reader stream
				csvReader.close();
				// close the buffer reader stream 
				bufferedReader.close();
			} catch (Exception e) {
				logger.error("Line " + Thread.currentThread().getStackTrace()[1].getLineNumber() + ": " + e.toString());
			}
		}
	}
}