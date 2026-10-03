package com.FieldServiceManagement.service;

import com.FieldServiceManagement.repository.WorkOrderRepository;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component
public class WorkOrderCodeGenerator {

    private final WorkOrderRepository workOrderRepository;

    public WorkOrderCodeGenerator(WorkOrderRepository workOrderRepository) {
        this.workOrderRepository = workOrderRepository;
    }

    public String generate() {
        int year = Year.now().getValue();
        long count = workOrderRepository.count() + 1;
        return String.format("WO-%d-%04d", year, count);
    }
}