package com.FieldServiceManagement.repository;

import com.FieldServiceManagement.domain.Part;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartRepository extends JpaRepository<Part, Long> {
}