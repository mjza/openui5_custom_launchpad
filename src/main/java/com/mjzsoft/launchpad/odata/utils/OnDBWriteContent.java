// http://olingo.apache.org/doc/odata2/tutorials/HandlingClobAndBlob.html
package com.mjzsoft.launchpad.odata.utils;

import java.sql.Blob;
import java.sql.Clob;
import java.sql.SQLException;

import javax.sql.rowset.serial.SerialBlob;
import javax.sql.rowset.serial.SerialClob;
import javax.sql.rowset.serial.SerialException;

import org.apache.olingo.odata2.jpa.processor.api.OnJPAWriteContent;
import org.apache.olingo.odata2.jpa.processor.api.exception.ODataJPARuntimeException;

public class OnDBWriteContent implements OnJPAWriteContent {

	@Override
	public Blob getJPABlob(byte[] binaryData) throws ODataJPARuntimeException {
		try {
			return new SerialBlob(binaryData);
		} catch (SerialException e) {
			ODataJPARuntimeException.throwException(ODataJPARuntimeException.INNER_EXCEPTION, e);
		} catch (SQLException e) {
			ODataJPARuntimeException.throwException(ODataJPARuntimeException.INNER_EXCEPTION, e);
		}
		return null;
	}

	@Override
	public Clob getJPAClob(char[] characterData) throws ODataJPARuntimeException {
		try {
			return new SerialClob(characterData);
		} catch (SQLException e) {
			ODataJPARuntimeException.throwException(ODataJPARuntimeException.INNER_EXCEPTION, e);
		}
		return null;
	}
}
