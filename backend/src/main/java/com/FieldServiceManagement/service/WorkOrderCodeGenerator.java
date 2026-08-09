package com.FieldServiceManagement.service;

import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class WorkOrderCodeGenerator {

    private final AtomicLong counter = new AtomicLong(1);

    public String generate() {
        int year = Year.now().getValue();
        long number = counter.getAndIncrement();
        return String.format("WO-%d-%04d", year, number);
    }
}