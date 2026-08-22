package com.FieldServiceManagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinOrgRequest {
    @NotBlank
    private String inviteCode;
}