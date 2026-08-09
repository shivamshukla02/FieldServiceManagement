package com.FieldServiceManagement.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "time_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    private User technician;

    @Column(nullable = false)
    private Integer minutes;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "logged_at", nullable = false, updatable = false)
    private LocalDateTime loggedAt = LocalDateTime.now();
}