package com.elevateresume.backend.auth;

import java.util.UUID;

public record CurrentUser(UUID id, String email) {
}
