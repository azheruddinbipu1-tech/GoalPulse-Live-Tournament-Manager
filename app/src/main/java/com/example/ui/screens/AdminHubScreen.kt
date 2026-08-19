package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.TournamentRepository
import com.example.model.Match
import com.example.ui.components.AdminPinDialog

@Composable
fun AdminHubScreen(
    repository: TournamentRepository,
    onNavigateToLiveMatch: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val isAdminMode by repository.isAdminMode.collectAsState()
    val adminPin by repository.adminPin.collectAsState()
    val matches by repository.matches.collectAsState()
    val teams by repository.teams.collectAsState()
    val players by repository.players.collectAsState()

    var showPinDialog by remember { mutableStateOf(false) }
    var showCreateMatchDialog by remember { mutableStateOf(false) }
    var showChangePinDialog by remember { mutableStateOf(false) }
    var showResetConfirmDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 80.dp)
    ) {
        // Admin Status Banner
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isAdminMode) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = if (isAdminMode) MaterialTheme.colorScheme.primary else Color(0xFF757575),
                            modifier = Modifier.size(44.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    if (isAdminMode) Icons.Default.LockOpen else Icons.Default.Lock,
                                    contentDescription = null,
                                    tint = Color.White
                                )
                            }
                        }

                        Column {
                            Text(
                                text = if (isAdminMode) "Admin Mode (Unlocked)" else "Public / Spectator Mode",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                            Text(
                                text = if (isAdminMode) "Full access to live events, score rollback & squad budget" else "Read-only access. Unlock to manage matches.",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Button(
                        onClick = {
                            if (isAdminMode) {
                                repository.setAdminMode(false)
                            } else {
                                showPinDialog = true
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isAdminMode) Color(0xFFC62828) else MaterialTheme.colorScheme.primary
                        )
                    ) {
                        Text(if (isAdminMode) "Lock" else "Unlock", fontSize = 12.sp)
                    }
                }
            }
        }

        // Tournament Summary Metrics
        item {
            Text(
                text = "Tournament Statistics",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            val totalTransferValue = players.sumOf { it.purchasePrice }
            val totalGoals = matches.sumOf { it.homeScore + it.awayScore }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Total Clubs", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("${teams.size}", fontSize = 18.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                    }
                }

                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Total Players", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("${players.size}", fontSize = 18.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                    }
                }

                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
                    modifier = Modifier.weight(1.3f)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("League Market", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("৳${String.format("%.1f", totalTransferValue)}M", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color(0xFF2E7D32))
                    }
                }
            }
        }

        // Admin Management Actions
        if (isAdminMode) {
            item {
                Text(
                    text = "Tournament Management Tools",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Create Match Card
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(Icons.Default.AddCircleOutline, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                Column {
                                    Text("Schedule New Match", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text("Set up fixtures between clubs with venue & round", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }

                            Button(
                                onClick = { showCreateMatchDialog = true },
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text("New Match", fontSize = 12.sp)
                            }
                        }
                    }

                    // Change Admin PIN Card
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(Icons.Default.Pin, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                Column {
                                    Text("Change Admin PIN", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text("Current PIN: $adminPin", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }

                            OutlinedButton(
                                onClick = { showChangePinDialog = true },
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text("Edit PIN", fontSize = 12.sp)
                            }
                        }
                    }

                    // Reset Data Card
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(Icons.Default.Refresh, contentDescription = null, tint = Color(0xFFC62828))
                                Column {
                                    Text("Reset Sample Tournament", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text("Restores default teams, players and match events", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }

                            OutlinedButton(
                                onClick = { showResetConfirmDialog = true },
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFC62828)),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text("Reset All", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }

    // ==========================================
    // DIALOGS
    // ==========================================

    AdminPinDialog(
        isOpen = showPinDialog,
        onDismiss = { showPinDialog = false },
        onPinSuccess = {
            repository.setAdminMode(true)
            showPinDialog = false
        },
        verifyPin = { repository.verifyPin(it) }
    )

    // Create Match Dialog
    if (showCreateMatchDialog) {
        var homeTeamId by remember { mutableStateOf(teams.firstOrNull()?.id ?: "") }
        var awayTeamId by remember { mutableStateOf(teams.getOrNull(1)?.id ?: "") }
        var venue by remember { mutableStateOf("Bangabandhu National Stadium") }
        var matchDate by remember { mutableStateOf("Today, 20:00") }
        var round by remember { mutableStateOf("Super League Matchday 9") }

        AlertDialog(
            onDismissRequest = { showCreateMatchDialog = false },
            title = { Text("Schedule New Match", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("Home Team:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(teams) { t ->
                            FilterChip(
                                selected = homeTeamId == t.id,
                                onClick = { homeTeamId = t.id },
                                label = { Text(t.shortName, fontSize = 11.sp) }
                            )
                        }
                    }

                    Text("Away Team:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(teams.filter { it.id != homeTeamId }) { t ->
                            FilterChip(
                                selected = awayTeamId == t.id,
                                onClick = { awayTeamId = t.id },
                                label = { Text(t.shortName, fontSize = 11.sp) }
                            )
                        }
                    }

                    OutlinedTextField(
                        value = venue,
                        onValueChange = { venue = it },
                        label = { Text("Stadium Venue") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = matchDate,
                        onValueChange = { matchDate = it },
                        label = { Text("Date & Kickoff Time") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = round,
                        onValueChange = { round = it },
                        label = { Text("Match Round / Title") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (homeTeamId.isNotBlank() && awayTeamId.isNotBlank() && homeTeamId != awayTeamId) {
                            val newMatch = repository.createMatch(
                                homeTeamId = homeTeamId,
                                awayTeamId = awayTeamId,
                                venue = venue,
                                matchDate = matchDate,
                                round = round
                            )
                            repository.selectMatch(newMatch.id)
                            showCreateMatchDialog = false
                            onNavigateToLiveMatch(newMatch.id)
                        }
                    }
                ) {
                    Text("Schedule Match")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCreateMatchDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Change PIN Dialog
    if (showChangePinDialog) {
        var newPinInput by remember { mutableStateOf("") }
        var isError by remember { mutableStateOf(false) }

        AlertDialog(
            onDismissRequest = { showChangePinDialog = false },
            title = { Text("Set New Admin PIN", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "Enter at least 4 digits for your new tournament administrative PIN.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    OutlinedTextField(
                        value = newPinInput,
                        onValueChange = {
                            newPinInput = it.filter { c -> c.isDigit() }.take(6)
                            isError = false
                        },
                        label = { Text("New PIN (4-6 digits)") },
                        singleLine = true,
                        isError = isError,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newPinInput.length >= 4) {
                            repository.updatePin(newPinInput)
                            showChangePinDialog = false
                        } else {
                            isError = true
                        }
                    }
                ) {
                    Text("Update PIN")
                }
            },
            dismissButton = {
                TextButton(onClick = { showChangePinDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Reset Confirm Dialog
    if (showResetConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showResetConfirmDialog = false },
            title = { Text("Reset Tournament Data?", fontWeight = FontWeight.Bold) },
            text = { Text("This will reset all matches, scores, live events, teams, and budgets to default tournament sample data.") },
            confirmButton = {
                Button(
                    onClick = {
                        repository.resetToSampleData()
                        showResetConfirmDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828))
                ) {
                    Text("Confirm Reset")
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetConfirmDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
