package com.elevateresume.backend.jobs;

import com.elevateresume.backend.auth.AuthService;
import com.elevateresume.backend.auth.CurrentUser;
import com.elevateresume.backend.shared.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/job-descriptions")
public class JobDescriptionController {
    private final AuthService auth;
    private final JobDescriptionService jobs;

    public JobDescriptionController(AuthService auth, JobDescriptionService jobs) {
        this.auth = auth;
        this.jobs = jobs;
    }

    @GetMapping
    public ApiResponses.Data<List<JobDescriptionDtos.JobDescriptionResponse>> list(HttpServletRequest request) {
        CurrentUser user = auth.requireUser(request);
        return new ApiResponses.Data<>(jobs.list(user.id()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponses.Data<JobDescriptionDtos.JobDescriptionResponse> save(
            @RequestBody JobDescriptionDtos.JobDescriptionRequest body,
            HttpServletRequest request) {
        CurrentUser user = auth.requireUser(request);
        return new ApiResponses.Data<>(jobs.save(user.id(), body));
    }
}
