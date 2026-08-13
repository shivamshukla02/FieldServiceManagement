package com.FieldServiceManagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransitionRequest {
    @NotBlank
    private String toStatus;

    private String note;
}