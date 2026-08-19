package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.TournamentRepository
import com.example.model.*
import com.example.ui.components.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveMatchScreen(
    repository: TournamentRepository,
    modifier: Modifier = Modifier
) {
    val matches by repository.matches.collectAsState()
    val teams by repository.teams.collectAsState()
    val players by repository.players.collectAsState()
    val selectedMatchId by repository.selectedMatchId.collectAsState()
    val isAdminMode by repository.isAdminMode.collectAsState()

    val currentMatch = matches.find { it.id == selectedMatchId } ?: matches.firstOrNull()
    val homeTeam = teams.find { it.id == currentMatch?.homeTeamId }
    val awayTeam = teams.find { it.id == currentMatch?.awayTeamId }

    // Dialog state for adding live events
    var showAddEventDialog by remember { mutableStateOf(false) }
    var selectedEventType by remember { mutableStateOf(EventType.GOAL) }
    var showEditStoryDialog by remember { mutableStateOf(false) }
    var showDeleteConfirmDialog by remember { mutableStateOf<MatchEvent?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 80.dp)
    ) {
        // 1. Matches Carousel / Selector
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "Select Match",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(matches) { match ->
                        val hTeam = teams.find { it.id == match.homeTeamId }
                        val aTeam = teams.find { it.id == match.awayTeamId }
                        val isSelected = match.id == selectedMatchId

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                            border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null,
                            modifier = Modifier
                                .width(200.dp)
                                .clickable { repository.selectMatch(match.id) }
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = match.status.label,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (match.status.name.contains("LIVE")) Color(0xFFD32F2F) else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    if (match.isClockRunning) {
                                        LivePulsingBadge()
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = hTeam?.shortName ?: "HOM",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                    Text(
                                        text = "${match.homeScore} - ${match.awayScore}",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 16.sp,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    Text(
                                        text = aTeam?.shortName ?: "AWY",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        if (currentMatch != null && homeTeam != null && awayTeam != null) {
            // 2. Scoreboard Hero Card
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Match meta
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "${currentMatch.round} • ${currentMatch.venue}",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Team vs Team Score Board
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            // Home Team
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.weight(1f)
                            ) {
                                TeamBadge(
                                    logoUrl = homeTeam.logoUrl,
                                    teamName = homeTeam.name,
                                    shortName = homeTeam.shortName,
                                    primaryColorHex = homeTeam.primaryColorHex,
                                    size = 56.dp
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = homeTeam.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    textAlign = TextAlign.Center,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = homeTeam.city,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            // Score & Clock
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.padding(horizontal = 8.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = "${currentMatch.homeScore}",
                                        fontSize = 38.sp,
                                        fontWeight = FontWeight.Black,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    Text(
                                        text = ":",
                                        fontSize = 30.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(
                                        text = "${currentMatch.awayScore}",
                                        fontSize = 38.sp,
                                        fontWeight = FontWeight.Black,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }

                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (currentMatch.isClockRunning) Color(0xFFD32F2F).copy(alpha = 0.1f) else MaterialTheme.colorScheme.surfaceVariant
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        if (currentMatch.isClockRunning) {
                                            Box(
                                                modifier = Modifier
                                                    .size(6.dp)
                                                    .clip(CircleShape)
                                                    .background(Color(0xFFD32F2F))
                                            )
                                        }
                                        Text(
                                            text = if (currentMatch.status == MatchStatus.UPCOMING) "UPCOMING"
                                            else "${currentMatch.currentMinute}' ${currentMatch.status.label}",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (currentMatch.isClockRunning) Color(0xFFD32F2F) else MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }
                            }

                            // Away Team
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.weight(1f)
                            ) {
                                TeamBadge(
                                    logoUrl = awayTeam.logoUrl,
                                    teamName = awayTeam.name,
                                    shortName = awayTeam.shortName,
                                    primaryColorHex = awayTeam.primaryColorHex,
                                    size = 56.dp
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = awayTeam.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    textAlign = TextAlign.Center,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = awayTeam.city,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            // 3. Admin Match Controller (Only visible when Admin Mode is ON)
            if (isAdminMode) {
                item {
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        Icons.Default.SportsSoccer,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                    Text(
                                        text = "Live Match Controller",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp
                                    )
                                }

                                Text(
                                    text = "ADMIN ACTIVE",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }

                            // Match Clock & Status Buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Button(
                                    onClick = {
                                        repository.updateMatchClock(
                                            currentMatch.id,
                                            currentMatch.currentMinute,
                                            !currentMatch.isClockRunning
                                        )
                                    },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (currentMatch.isClockRunning) Color(0xFFC62828) else Color(0xFF2E7D32)
                                    ),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(
                                        if (currentMatch.isClockRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(if (currentMatch.isClockRunning) "Pause" else "Start Clock", fontSize = 12.sp)
                                }

                                OutlinedButton(
                                    onClick = {
                                        repository.updateMatchClock(
                                            currentMatch.id,
                                            currentMatch.currentMinute + 1
                                        )
                                    },
                                    modifier = Modifier.weight(0.7f)
                                ) {
                                    Text("+1 Min", fontSize = 12.sp)
                                }

                                OutlinedButton(
                                    onClick = {
                                        val nextStatus = when (currentMatch.status) {
                                            MatchStatus.UPCOMING -> MatchStatus.LIVE_1ST_HALF
                                            MatchStatus.LIVE_1ST_HALF -> MatchStatus.HALF_TIME
                                            MatchStatus.HALF_TIME -> MatchStatus.LIVE_2ND_HALF
                                            MatchStatus.LIVE_2ND_HALF -> MatchStatus.FINISHED
                                            MatchStatus.EXTRA_TIME -> MatchStatus.FINISHED
                                            MatchStatus.FINISHED -> MatchStatus.LIVE_1ST_HALF
                                        }
                                        repository.updateMatchStatus(currentMatch.id, nextStatus)
                                    },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Next Half", fontSize = 12.sp)
                                }
                            }

                            Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                            Text(
                                text = "Log Live Event (Score & Stats auto-update):",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )

                            // Fast Event Trigger Buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Button(
                                    onClick = {
                                        selectedEventType = EventType.GOAL
                                        showAddEventDialog = true
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32)),
                                    modifier = Modifier.weight(1f),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 8.dp)
                                ) {
                                    Text("⚽ Goal", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = {
                                        selectedEventType = EventType.YELLOW_CARD
                                        showAddEventDialog = true
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF9A825)),
                                    modifier = Modifier.weight(1f),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 8.dp)
                                ) {
                                    Text("🟨 Card", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                }

                                Button(
                                    onClick = {
                                        selectedEventType = EventType.RED_CARD
                                        showAddEventDialog = true
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828)),
                                    modifier = Modifier.weight(1f),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 8.dp)
                                ) {
                                    Text("🟥 Red", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = {
                                        selectedEventType = EventType.FOUL
                                        showAddEventDialog = true
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF455A64)),
                                    modifier = Modifier.weight(1f),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 8.dp)
                                ) {
                                    Text("🛑 Foul", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        selectedEventType = EventType.SAVE
                                        showAddEventDialog = true
                                    },
                                    modifier = Modifier.weight(1f),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 8.dp)
                                ) {
                                    Text("🧤 Save", fontSize = 12.sp)
                                }

                                OutlinedButton(
                                    onClick = {
                                        selectedEventType = EventType.SUBSTITUTION
                                        showAddEventDialog = true
                                    },
                                    modifier = Modifier.weight(1f),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 8.dp)
                                ) {
                                    Text("🔄 Sub", fontSize = 12.sp)
                                }

                                OutlinedButton(
                                    onClick = {
                                        showEditStoryDialog = true
                                    },
                                    modifier = Modifier.weight(1.3f),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 8.dp)
                                ) {
                                    Icon(Icons.Default.EditNote, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("📝 Match Story", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }

            // 4. Match Story / Notes Section
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(text = "📝", fontSize = 16.sp)
                                Text(
                                    text = "Match Story & Notes",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }

                            if (isAdminMode) {
                                IconButton(
                                    onClick = { showEditStoryDialog = true },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Edit,
                                        contentDescription = "Edit Story",
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }

                        Text(
                            text = if (currentMatch.matchStoryNotes.isNotBlank())
                                currentMatch.matchStoryNotes
                            else "No match notes or commentary added yet for this game.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // 5. Live Events Timeline & Score Rollback
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Match Events Timeline (${currentMatch.events.size})",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )

                    if (isAdminMode && currentMatch.events.isNotEmpty()) {
                        Text(
                            text = "🗑️ Tap trash to Rollback score",
                            fontSize = 11.sp,
                            color = Color(0xFFD32F2F),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            if (currentMatch.events.isEmpty()) {
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(text = "⚽", fontSize = 28.sp)
                            Text(
                                text = "No live events recorded yet",
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            if (isAdminMode) {
                                Text(
                                    text = "Use the admin controller above to log goals, cards, fouls and assists.",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }
            } else {
                items(currentMatch.events, key = { it.id }) { event ->
                    val eventTeam = teams.find { it.id == event.teamId }
                    val isHomeEvent = event.teamId == currentMatch.homeTeamId

                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (event.type == EventType.GOAL) Color(0xFF2E7D32).copy(alpha = 0.3f)
                            else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Minute Badge
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = MaterialTheme.colorScheme.primaryContainer,
                                modifier = Modifier.width(42.dp)
                            ) {
                                Text(
                                    text = "${event.minute}'",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 13.sp,
                                    textAlign = TextAlign.Center,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    modifier = Modifier.padding(vertical = 4.dp)
                                )
                            }

                            // Event Details
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    EventTypeChip(type = event.type)
                                    Text(
                                        text = eventTeam?.shortName ?: "",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = event.playerName,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )

                                if (event.assistPlayerName != null) {
                                    Text(
                                        text = "👟 Assist: ${event.assistPlayerName}",
                                        fontSize = 12.sp,
                                        color = Color(0xFF512DA8),
                                        fontWeight = FontWeight.Medium
                                    )
                                }

                                if (event.subOutPlayerName != null) {
                                    Text(
                                        text = "🔄 Sub: In for ${event.subOutPlayerName}",
                                        fontSize = 12.sp,
                                        color = Color(0xFF6A1B9A),
                                        fontWeight = FontWeight.Medium
                                    )
                                }

                                if (event.note.isNotBlank()) {
                                    Text(
                                        text = event.note,
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            // 🗑️ Event Delete with Score Rollback (Admin Mode)
                            if (isAdminMode) {
                                IconButton(
                                    onClick = { showDeleteConfirmDialog = event },
                                    colors = IconButtonDefaults.iconButtonColors(
                                        contentColor = Color(0xFFD32F2F)
                                    )
                                ) {
                                    Icon(
                                        Icons.Default.DeleteOutline,
                                        contentDescription = "Rollback / Delete Event",
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ==========================================
    // DIALOG: ADD MATCH EVENT
    // ==========================================
    if (showAddEventDialog && currentMatch != null && homeTeam != null && awayTeam != null) {
        var selectedTeamId by remember { mutableStateOf(currentMatch.homeTeamId) }
        val teamPlayers = players.filter { it.teamId == selectedTeamId }
        var selectedPlayerId by remember { mutableStateOf(teamPlayers.firstOrNull()?.id ?: "") }
        var selectedAssistPlayerId by remember { mutableStateOf<String?>(null) }
        var eventMinute by remember { mutableStateOf(currentMatch.currentMinute.coerceAtLeast(1).toString()) }
        var eventNote by remember { mutableStateOf("") }
        var localEventType by remember { mutableStateOf(selectedEventType) }

        AlertDialog(
            onDismissRequest = { showAddEventDialog = false },
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(localEventType.icon, fontSize = 20.sp)
                    Text("Log Live Match Event", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Event Type Selector Row
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(EventType.entries.toList()) { type ->
                            FilterChip(
                                selected = localEventType == type,
                                onClick = { localEventType = type },
                                label = { Text("${type.icon} ${type.label}", fontSize = 11.sp) }
                            )
                        }
                    }

                    // Minute & Team Selection
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = eventMinute,
                            onValueChange = { eventMinute = it.filter { c -> c.isDigit() }.take(3) },
                            label = { Text("Minute (1-120)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )

                        Column(modifier = Modifier.weight(1.5f)) {
                            Text("Team", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                FilterChip(
                                    selected = selectedTeamId == homeTeam.id,
                                    onClick = {
                                        selectedTeamId = homeTeam.id
                                        selectedPlayerId = players.filter { it.teamId == homeTeam.id }.firstOrNull()?.id ?: ""
                                        selectedAssistPlayerId = null
                                    },
                                    label = { Text(homeTeam.shortName, fontSize = 12.sp) }
                                )
                                FilterChip(
                                    selected = selectedTeamId == awayTeam.id,
                                    onClick = {
                                        selectedTeamId = awayTeam.id
                                        selectedPlayerId = players.filter { it.teamId == awayTeam.id }.firstOrNull()?.id ?: ""
                                        selectedAssistPlayerId = null
                                    },
                                    label = { Text(awayTeam.shortName, fontSize = 12.sp) }
                                )
                            }
                        }
                    }

                    // Main Player Selection
                    Text("Primary Player / Scorer:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(teamPlayers) { player ->
                            FilterChip(
                                selected = selectedPlayerId == player.id,
                                onClick = { selectedPlayerId = player.id },
                                label = { Text("#${player.jerseyNumber} ${player.name}", fontSize = 11.sp) }
                            )
                        }
                    }

                    // Optional Assist Player for Goal
                    if (localEventType == EventType.GOAL || localEventType == EventType.PENALTY_GOAL) {
                        Text("Assist By (Optional):", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        val otherPlayers = teamPlayers.filter { it.id != selectedPlayerId }
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            item {
                                FilterChip(
                                    selected = selectedAssistPlayerId == null,
                                    onClick = { selectedAssistPlayerId = null },
                                    label = { Text("None / Solo", fontSize = 11.sp) }
                                )
                            }
                            items(otherPlayers) { player ->
                                FilterChip(
                                    selected = selectedAssistPlayerId == player.id,
                                    onClick = { selectedAssistPlayerId = player.id },
                                    label = { Text("👟 #${player.jerseyNumber} ${player.name}", fontSize = 11.sp) }
                                )
                            }
                        }
                    }

                    // Event description / note
                    OutlinedTextField(
                        value = eventNote,
                        onValueChange = { eventNote = it },
                        label = { Text("Description / Note (Optional)") },
                        placeholder = { Text("e.g. Header from corner kick") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val min = eventMinute.toIntOrNull() ?: currentMatch.currentMinute.coerceAtLeast(1)
                        if (selectedPlayerId.isNotBlank()) {
                            repository.addMatchEvent(
                                matchId = currentMatch.id,
                                type = localEventType,
                                minute = min,
                                teamId = selectedTeamId,
                                playerId = selectedPlayerId,
                                assistPlayerId = selectedAssistPlayerId,
                                note = eventNote
                            )
                            showAddEventDialog = false
                        }
                    }
                ) {
                    Text("Save Event & Update Score")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddEventDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // ==========================================
    // DIALOG: EDIT MATCH STORY / NOTE
    // ==========================================
    if (showEditStoryDialog && currentMatch != null) {
        var storyInput by remember { mutableStateOf(currentMatch.matchStoryNotes) }

        AlertDialog(
            onDismissRequest = { showEditStoryDialog = false },
            title = { Text("Edit Match Story & Notes", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "Write match summary, tactical notes, or commentary updates for spectators:",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    OutlinedTextField(
                        value = storyInput,
                        onValueChange = { storyInput = it },
                        placeholder = { Text("Write key moments, game recap, star performers...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        maxLines = 6
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        repository.updateMatchStory(currentMatch.id, storyInput)
                        showEditStoryDialog = false
                    }
                ) {
                    Text("Save Story")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditStoryDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // ==========================================
    // DIALOG: ROLLBACK CONFIRMATION
    // ==========================================
    showDeleteConfirmDialog?.let { eventToDelete ->
        AlertDialog(
            onDismissRequest = { showDeleteConfirmDialog = null },
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFD32F2F))
                    Text("Rollback & Delete Event?", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Are you sure you want to delete this event?")
                    Text(
                        text = "${eventToDelete.minute}' ${eventToDelete.type.icon} ${eventToDelete.type.label} - ${eventToDelete.playerName}",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    if (eventToDelete.type == EventType.GOAL || eventToDelete.type == EventType.PENALTY_GOAL || eventToDelete.type == EventType.OWN_GOAL) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFFFFEBEE),
                            modifier = Modifier.fillMaxWidth().padding(top = 6.dp)
                        ) {
                            Text(
                                text = "⚠️ Score Rollback: The match score and player's goal count will automatically be decremented by 1.",
                                color = Color(0xFFC62828),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        currentMatch?.let { match ->
                            repository.deleteMatchEvent(match.id, eventToDelete.id)
                        }
                        showDeleteConfirmDialog = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F))
                ) {
                    Text("Confirm Rollback")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirmDialog = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}
