package com.complaint.redressal.controller;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.model.Complaint;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ComplaintService complaintService;
    private final AdminRepository adminRepository;

    public AdminController(ComplaintService complaintService, AdminRepository adminRepository) {
        this.complaintService = complaintService;
        this.adminRepository = adminRepository;
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Admin admin = adminRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        String statusStr = payload.get("status");
        String remarks = payload.get("remarks");

        try {
            Complaint.Status status = Complaint.Status.valueOf(statusStr);
            Complaint updated = complaintService.updateStatus(id, status, remarks, admin);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
    }
}
