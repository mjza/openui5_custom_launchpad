package com.mjzsoft.launchpad.odata.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.hibernate.resource.jdbc.spi.StatementInspector;

public class SqlStatementInspector implements StatementInspector {

    private static final long serialVersionUID = 1L;
    private static final Logger logger = LoggerFactory.getLogger(SqlStatementInspector.class);

    @Override
    public String inspect(String sql) {
        if (!sql.contains("escape \'\\'")) {
            return sql;
        }
        // OData JPA query correction -> current version (2.0.11) contains
        // the invalid 'escape "\"' statement that delivers no results
        logger.info("Replacing invalid statement: escape \'\\\'");
        return sql.replace("escape \'\\'", "escape \'\\\\'");
    }
}