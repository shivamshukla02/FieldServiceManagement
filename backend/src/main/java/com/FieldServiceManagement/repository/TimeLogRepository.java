package com.FieldServiceManagement.repository;

import com.FieldServiceManagement.domain.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByWorkOrderId(Long workOrderId);
}