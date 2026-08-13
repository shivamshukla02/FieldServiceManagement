package com.FieldServiceManagement.service;

import com.FieldServiceManagement.domain.User;
import com.FieldServiceManagement.domain.WorkOrder;
import com.FieldServiceManagement.domain.WorkOrderStatusHistory;
import com.FieldServiceManagement.repository.WorkOrderRepository;
import com.FieldServiceManagement.repository.WorkOrderStatusHistoryRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class WorkOrderLifecycleService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderStatusHistoryRepository historyRepository;
    private final com.FieldServiceManagement.repository.UserRepository userRepository;

    // allowed transitions: fromStatus -> set of allowed toStatuses
    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
            "NEW", Set.of("ASSIGNED", "CANCELLED"),
            "ASSIGNED", Set.of("IN_PROGRESS", "CANCELLED"),
            "IN_PROGRESS", Set.of("ON_HOLD", "COMPLETED"),
            "ON_HOLD", Set.of("IN_PROGRESS"),
            "COMPLETED", Set.of("CLOSED"),
            "CLOSED", Set.of(),
            "CANCELLED", Set.of()
    );

    // which roles are allowed to perform which transition (toStatus -> allowed roles)
    private static final Map<String, Set<String>> TRANSITION_ROLES = Map.of(
            "ASSIGNED", Set.of("DISPATCHER", "MANAGER"),
            "IN_PROGRESS", Set.of("TECHNICIAN"),
            "ON_HOLD", Set.of("TECHNICIAN"),
            "COMPLETED", Set.of("TECHNICIAN"),
            "CLOSED", Set.of("MANAGER"),
            "CANCELLED", Set.of("DISPATCHER", "MANAGER")
    );

    public WorkOrderLifecycleService(WorkOrderRepository workOrderRepository,
                                      WorkOrderStatusHistoryRepository historyRepository,
                                      com.FieldServiceManagement.repository.UserRepository userRepository) {
        this.workOrderRepository = workOrderRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WorkOrder transition(Long workOrderId, String toStatus, String note) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + workOrderId));

        String fromStatus = wo.getStatus();

        Set<String> allowedNext = ALLOWED_TRANSITIONS.getOrDefault(fromStatus, Set.of());
        if (!allowedNext.contains(toStatus)) {
            throw new IllegalStateException(
                    "Illegal transition: cannot move from " + fromStatus + " to " + toStatus
            );
        }

        String currentUserEmail = getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentUserEmail));

        Set<String> allowedRoles = TRANSITION_ROLES.getOrDefault(toStatus, Set.of());
        if (!allowedRoles.contains(currentUser.getRole())) {
            throw new SecurityException(
                    "Role " + currentUser.getRole() + " is not allowed to transition to " + toStatus
            );
        }

        // if technician-only transition, verify it's THEIR assigned job
        if (allowedRoles.contains("TECHNICIAN") && currentUser.getRole().equals("TECHNICIAN")) {
            if (wo.getAssignedTo() == null || !wo.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new SecurityException("Technician can only act on their own assigned work orders");
            }
        }

        // apply the change
        wo.setStatus(toStatus);
        wo.setUpdatedAt(LocalDateTime.now());
        workOrderRepository.save(wo);

        // write audit row
        WorkOrderStatusHistory history = new WorkOrderStatusHistory();
        history.setWorkOrder(wo);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setChangedBy(currentUser);
        history.setChangedAt(LocalDateTime.now());
        history.setNote(note);
        historyRepository.save(history);

        return wo;
    }

    public List<WorkOrderStatusHistory> getHistory(Long workOrderId) {
        return historyRepository.findByWorkOrderIdOrderByChangedAtAsc(workOrderId);
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}