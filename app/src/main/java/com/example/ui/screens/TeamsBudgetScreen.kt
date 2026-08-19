package com.example.ui.screens

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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.TournamentRepository
import com.example.model.Player
import com.example.model.Position
import com.example.model.Team
import com.example.ui.components.PlayerAvatar
import com.example.ui.components.TeamBadge
import java.util.UUID

@Composable
fun TeamsBudgetScreen(
    repository: TournamentRepository,
    modifier: Modifier = Modifier
) {
    val teams by repository.teams.collectAsState()
    val players by repository.players.collectAsState()
    val isAdminMode by repository.isAdminMode.collectAsState()

    var selectedTeamId by remember { mutableStateOf(teams.firstOrNull()?.id ?: "") }
    val currentTeam = teams.find { it.id == selectedTeamId } ?: teams.firstOrNull()
    val teamPlayers = players.filter { it.teamId == currentTeam?.id }

    // Dialog States
    var editingTeam by remember { mutableStateOf<Team?>(null) }
    var editingPlayer by remember { mutableStateOf<Player?>(null) }
    var showAddTeamDialog by remember { mutableStateOf(false) }
    var showAddPlayerDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 80.dp)
    ) {
        // 1. Team Selector Horizontal Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Clubs & Squad Budget",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                if (isAdminMode) {
                    FilledTonalButton(
                        onClick = { showAddTeamDialog = true },
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("New Club", fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(teams) { team ->
                    val isSelected = team.id == currentTeam?.id
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                        border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null,
                        modifier = Modifier
                            .width(150.dp)
                            .clickable { selectedTeamId = team.id }
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            TeamBadge(
                                logoUrl = team.logoUrl,
                                teamName = team.name,
                                shortName = team.shortName,
                                primaryColorHex = team.primaryColorHex,
                                size = 32.dp
                            )
                            Column {
                                Text(
                                    text = team.shortName,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = "৳${team.totalBudget}M",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }

        if (currentTeam != null) {
            val spentBudget = currentTeam.getSpentBudget(players)
            val remainingBudget = currentTeam.getRemainingBudget(players)
            val budgetProgress = if (currentTeam.totalBudget > 0) (spentBudget / currentTeam.totalBudget).toFloat().coerceIn(0f, 1f) else 0f

            // 2. Team Budget Overview Card 🏟️
            item {
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                TeamBadge(
                                    logoUrl = currentTeam.logoUrl,
                                    teamName = currentTeam.name,
                                    shortName = currentTeam.shortName,
                                    primaryColorHex = currentTeam.primaryColorHex,
                                    size = 52.dp
                                )
                                Column {
                                    Text(
                                        text = currentTeam.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 17.sp
                                    )
                                    Text(
                                        text = "Coach: ${currentTeam.coach.ifBlank { "N/A" }} • ${currentTeam.city}",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            if (isAdminMode) {
                                IconButton(onClick = { editingTeam = currentTeam }) {
                                    Icon(
                                        Icons.Default.Edit,
                                        contentDescription = "Edit Team",
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                        }

                        Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

                        // Budget Metrics Row 💰
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Total Budget (মোট বাজেট)",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "৳${currentTeam.totalBudget}M",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "Squad Spent (ক্রয় মূল্য)",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "৳${String.format("%.1f", spentBudget)}M",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFC62828)
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "Remaining (অবশিষ্ট)",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "৳${String.format("%.1f", remainingBudget)}M",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF2E7D32)
                                )
                            }
                        }

                        // Budget Utilization Bar
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            LinearProgressIndicator(
                                progress = { budgetProgress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(8.dp)
                                    .clip(RoundedCornerShape(4.dp)),
                                color = if (budgetProgress > 0.9f) Color(0xFFC62828) else MaterialTheme.colorScheme.primary,
                                trackColor = MaterialTheme.colorScheme.surfaceVariant
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Budget Utilization: ${(budgetProgress * 100).toInt()}%",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "${teamPlayers.size} Registered Players",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            // 3. Squad Header & Add Player Button
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "${currentTeam.shortName} Squad Roster",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )

                    if (isAdminMode) {
                        Button(
                            onClick = { showAddPlayerDialog = true },
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Add Player", fontSize = 12.sp)
                        }
                    }
                }
            }

            // 4. Squad List
            if (teamPlayers.isEmpty()) {
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
                            Text(text = "👤", fontSize = 28.sp)
                            Text(
                                text = "No players signed for this club yet",
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            } else {
                items(teamPlayers, key = { it.id }) { player ->
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Player Avatar with position
                            PlayerAvatar(
                                photoUrl = player.photoUrl,
                                playerName = player.name,
                                position = player.position,
                                size = 48.dp
                            )

                            // Player Name & Position Details
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = "#${player.jerseyNumber}",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 14.sp,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    Text(
                                        text = player.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = player.position.displayName,
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(text = "•", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text(
                                        text = "💰 ক্রয় মূল্য: ৳${player.purchasePrice}M",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF2E7D32)
                                    )
                                }

                                // Player mini-stats (goals, assists, cards)
                                Row(
                                    modifier = Modifier.padding(top = 4.dp),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    if (player.goals > 0) Text(text = "⚽ ${player.goals}", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    if (player.assists > 0) Text(text = "👟 ${player.assists}", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    if (player.yellowCards > 0) Text(text = "🟨 ${player.yellowCards}", fontSize = 10.sp)
                                    if (player.redCards > 0) Text(text = "🟥 ${player.redCards}", fontSize = 10.sp)
                                    if (player.saves > 0) Text(text = "🧤 ${player.saves}", fontSize = 10.sp)
                                }
                            }

                            // Admin Actions (Edit/Delete)
                            if (isAdminMode) {
                                Row {
                                    IconButton(
                                        onClick = { editingPlayer = player },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Edit,
                                            contentDescription = "Edit Player",
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }

                                    IconButton(
                                        onClick = { repository.deletePlayer(player.id) },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.DeleteOutline,
                                            contentDescription = "Delete Player",
                                            tint = Color(0xFFD32F2F),
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ==========================================
    // DIALOG: ADD/EDIT TEAM
    // ==========================================
    if (showAddTeamDialog || editingTeam != null) {
        val isEditing = editingTeam != null
        val targetTeam = editingTeam
        var teamName by remember { mutableStateOf(targetTeam?.name ?: "") }
        var shortName by remember { mutableStateOf(targetTeam?.shortName ?: "") }
        var logoUrl by remember { mutableStateOf(targetTeam?.logoUrl ?: "") }
        var totalBudget by remember { mutableStateOf(targetTeam?.totalBudget?.toString() ?: "150.0") }
        var city by remember { mutableStateOf(targetTeam?.city ?: "") }
        var coach by remember { mutableStateOf(targetTeam?.coach ?: "") }

        AlertDialog(
            onDismissRequest = {
                showAddTeamDialog = false
                editingTeam = null
            },
            title = { Text(if (isEditing) "Edit Team & Budget" else "Register New Club", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = teamName,
                        onValueChange = { teamName = it },
                        label = { Text("Club Name") },
                        placeholder = { Text("e.g. Dhaka Kings") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = shortName,
                            onValueChange = { shortName = it.take(4).uppercase() },
                            label = { Text("Code (e.g. DHK)") },
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )

                        OutlinedTextField(
                            value = totalBudget,
                            onValueChange = { totalBudget = it },
                            label = { Text("Budget (৳ Millions)") },
                            singleLine = true,
                            modifier = Modifier.weight(1.3f)
                        )
                    }

                    OutlinedTextField(
                        value = logoUrl,
                        onValueChange = { logoUrl = it },
                        label = { Text("🖼️ Team Logo URL") },
                        placeholder = { Text("https://example.com/logo.png") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = city,
                            onValueChange = { city = it },
                            label = { Text("City / Region") },
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = coach,
                            onValueChange = { coach = it },
                            label = { Text("Head Coach") },
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val budget = totalBudget.toDoubleOrNull() ?: 100.0
                        if (teamName.isNotBlank()) {
                            if (isEditing && targetTeam != null) {
                                repository.updateTeam(
                                    targetTeam.copy(
                                        name = teamName,
                                        shortName = shortName.ifBlank { teamName.take(3).uppercase() },
                                        logoUrl = logoUrl,
                                        totalBudget = budget,
                                        city = city,
                                        coach = coach
                                    )
                                )
                            } else {
                                val newTeam = Team(
                                    id = "team-" + UUID.randomUUID().toString().take(6),
                                    name = teamName,
                                    shortName = shortName.ifBlank { teamName.take(3).uppercase() },
                                    logoUrl = logoUrl,
                                    totalBudget = budget,
                                    city = city,
                                    coach = coach
                                )
                                repository.addTeam(newTeam)
                                selectedTeamId = newTeam.id
                            }
                            showAddTeamDialog = false
                            editingTeam = null
                        }
                    }
                ) {
                    Text("Save Team")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showAddTeamDialog = false
                        editingTeam = null
                    }
                ) {
                    Text("Cancel")
                }
            }
        )
    }

    // ==========================================
    // DIALOG: ADD/EDIT PLAYER
    // ==========================================
    if (showAddPlayerDialog || editingPlayer != null) {
        val isEditing = editingPlayer != null
        val targetPlayer = editingPlayer
        var playerName by remember { mutableStateOf(targetPlayer?.name ?: "") }
        var jerseyNumber by remember { mutableStateOf(targetPlayer?.jerseyNumber?.toString() ?: "10") }
        var position by remember { mutableStateOf(targetPlayer?.position ?: Position.FORWARD) }
        var photoUrl by remember { mutableStateOf(targetPlayer?.photoUrl ?: "") }
        var purchasePrice by remember { mutableStateOf(targetPlayer?.purchasePrice?.toString() ?: "20.0") }
        var targetTeamId by remember { mutableStateOf(targetPlayer?.teamId ?: currentTeam?.id ?: "") }

        AlertDialog(
            onDismissRequest = {
                showAddPlayerDialog = false
                editingPlayer = null
            },
            title = { Text(if (isEditing) "Edit Player Profile" else "Sign New Player", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = playerName,
                        onValueChange = { playerName = it },
                        label = { Text("Player Full Name") },
                        placeholder = { Text("e.g. Jamal Bhuyan") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = jerseyNumber,
                            onValueChange = { jerseyNumber = it.filter { c -> c.isDigit() }.take(2) },
                            label = { Text("Jersey #") },
                            singleLine = true,
                            modifier = Modifier.weight(0.8f)
                        )

                        OutlinedTextField(
                            value = purchasePrice,
                            onValueChange = { purchasePrice = it },
                            label = { Text("💰 ক্রয় মূল্য (৳ Millions)") },
                            singleLine = true,
                            modifier = Modifier.weight(1.4f)
                        )
                    }

                    // Position Selector
                    Text("Field Position:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(Position.entries.toList()) { pos ->
                            FilterChip(
                                selected = position == pos,
                                onClick = { position = pos },
                                label = { Text(pos.displayName, fontSize = 11.sp) }
                            )
                        }
                    }

                    // Team Assignment (if editing or adding)
                    Text("Club Assignment:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(teams) { t ->
                            FilterChip(
                                selected = targetTeamId == t.id,
                                onClick = { targetTeamId = t.id },
                                label = { Text(t.shortName, fontSize = 11.sp) }
                            )
                        }
                    }

                    OutlinedTextField(
                        value = photoUrl,
                        onValueChange = { photoUrl = it },
                        label = { Text("👤 Player Photo URL") },
                        placeholder = { Text("https://example.com/player.jpg") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val price = purchasePrice.toDoubleOrNull() ?: 10.0
                        val num = jerseyNumber.toIntOrNull() ?: 9
                        if (playerName.isNotBlank()) {
                            if (isEditing && targetPlayer != null) {
                                repository.updatePlayer(
                                    targetPlayer.copy(
                                        name = playerName,
                                        jerseyNumber = num,
                                        position = position,
                                        photoUrl = photoUrl,
                                        purchasePrice = price,
                                        teamId = targetTeamId
                                    )
                                )
                            } else {
                                val newPlayer = Player(
                                    id = "p-" + UUID.randomUUID().toString().take(6),
                                    teamId = targetTeamId,
                                    name = playerName,
                                    jerseyNumber = num,
                                    position = position,
                                    photoUrl = photoUrl,
                                    purchasePrice = price
                                )
                                repository.addPlayer(newPlayer)
                            }
                            showAddPlayerDialog = false
                            editingPlayer = null
                        }
                    }
                ) {
                    Text("Save Player")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showAddPlayerDialog = false
                        editingPlayer = null
                    }
                ) {
                    Text("Cancel")
                }
            }
        )
    }
}
