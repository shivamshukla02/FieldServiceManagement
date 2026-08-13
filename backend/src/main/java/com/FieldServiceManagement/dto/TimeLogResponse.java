package com.FieldServiceManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class TimeLogResponse {
    private Long id;
    private String technicianName;
    private Integer minutes;
    private String note;
    private LocalDateTime loggedAt;
}