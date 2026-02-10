package com.complaint.redressal.service;

import com.complaint.redressal.model.Complaint;
import com.complaint.redressal.model.Department;
import com.complaint.redressal.model.StatusHistory;
import com.complaint.redressal.model.User;
import com.complaint.redressal.repository.ComplaintRepository;
import com.complaint.redressal.repository.DepartmentRepository;
import com.complaint.redressal.repository.StatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    public ComplaintService(ComplaintRepository complaintRepository, DepartmentRepository departmentRepository, StatusHistoryRepository statusHistoryRepository) {
        this.complaintRepository = complaintRepository;
        this.departmentRepository = departmentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    @Transactional
    public Complaint createComplaint(Complaint complaint, User user) {
        complaint.setUser(user);
        complaint.setStatus(Complaint.Status.PENDING);

        // Auto-assign department
        String deptName = mapCategoryToDepartment(complaint.getCategory());
        Optional<Department> dept = departmentRepository.findByName(deptName);
        dept.ifPresent(complaint::setAssignedDepartment);

        return complaintRepository.save(complaint);
    }

    public List<Complaint> getComplaintsByUser(Long userId) {
        return complaintRepository.findByUserId(userId);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    @Transactional
    public Complaint updateStatus(Long complaintId, Complaint.Status status, String remarks, com.complaint.redressal.model.Admin admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(status);
        complaintRepository.save(complaint);

        StatusHistory history = new StatusHistory();
        history.setComplaint(complaint);
        history.setStatus(status);
        history.setRemarks(remarks);
        history.setUpdatedBy(admin);
        statusHistoryRepository.save(history);

        return complaint;
    }

    private String mapCategoryToDepartment(Complaint.Category category) {
        switch (category) {
            case ROAD: return "Roads";
            case GARBAGE: return "Sanitation";
            case WATER: return "Water";
            case ELECTRICITY: return "Electricity";
            default: return "General";
        }
    }
}
