package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

public interface BaseService<T> {
	public Class<T> getType();
    public Optional<T> findById(String id);
}