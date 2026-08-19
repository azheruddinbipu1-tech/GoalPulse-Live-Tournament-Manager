package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
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
import com.example.ui.components.PlayerAvatar
import com.example.ui.components.TeamBadge

enum class LeaderboardCategory(val title: String, val icon: String) {
    GOALS("Top Scorers", "⚽"),
    ASSISTS("Top Assists", "👟"),
    CARDS_FOULS("Cards & Fouls", "🟨🟥"),
    SAVES("Top Goalkeepers", "🧤"),
    MARKET_VALUE("Player Value", "💰")
}

@Composable
fun LeaderboardScreen(
    repository: TournamentRepository,
    modifier: Modifier = Modifier
) {
    val players by repository.players.collectAsState()
    val teams by repository.teams.collectAsState()

    var selectedCategory by remember { mutableStateOf(LeaderboardCategory.GOALS) }

    val sortedPlayers = remember(players, selectedCategory) {
        when (selectedCategory) {
            LeaderboardCategory.GOALS -> players.filter { it.goals > 0 }.sortedByDescending { it.goals }
            LeaderboardCategory.ASSISTS -> players.filter { it.assists > 0 }.sortedByDescending { it.assists }
            LeaderboardCategory.CARDS_FOULS -> players.sortedByDescending { (it.redCards * 3) + it.yellowCards + (it.fouls * 0.1) }
            LeaderboardCategory.SAVES -> players.filter { it.saves > 0 }.sortedByDescending { it.saves }
            LeaderboardCategory.MARKET_VALUE -> players.sortedByDescending { it.purchasePrice }
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 80.dp)
    ) {
        // Category Chips Row
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "Player Leaderboards & Stats",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(LeaderboardCategory.values().toList()) { category ->
                        FilterChip(
                            selected = selectedCategory == category,
                            onClick = { selectedCategory = category },
                            label = { Text("${category.icon} ${category.title}", fontSize = 12.sp) }
                        )
                    }
                }
            }
        }

        // Leaderboard List
        if (sortedPlayers.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(text = selectedCategory.icon, fontSize = 32.sp)
                        Text(
                            text = "No stats recorded for ${selectedCategory.title} yet",
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            itemsIndexed(sortedPlayers, key = { _, p -> p.id }) { index, player ->
                val rank = index + 1
                val playerTeam = teams.find { it.id == player.teamId }

                val (medalColor, medalText) = when (rank) {
                    1 -> Color(0xFFFFD700) to "🥇"
                    2 -> Color(0xFFC0C0C0) to "🥈"
                    3 -> Color(0xFFCD7F32) to "🥉"
                    else -> MaterialTheme.colorScheme.surfaceVariant to "$rank"
                }

                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (rank == 1) Color(0xFFFFD700).copy(alpha = 0.5f)
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
                        // Rank Badge
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(if (rank <= 3) Color.Transparent else MaterialTheme.colorScheme.surfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = medalText,
                                fontSize = if (rank <= 3) 18.sp else 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Player Photo Avatar
                        PlayerAvatar(
                            photoUrl = player.photoUrl,
                            playerName = player.name,
                            position = player.position,
                            size = 46.dp
                        )

                        // Player Info
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "#${player.jerseyNumber} ${player.name}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = playerTeam?.name ?: "Free Agent",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "•",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "💰 ৳${player.purchasePrice}M",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF2E7D32)
                                )
                            }
                        }

                        // Stat Value by Category
                        Column(horizontalAlignment = Alignment.End) {
                            when (selectedCategory) {
                                LeaderboardCategory.GOALS -> {
                                    Text(
                                        text = "${player.goals}",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF2E7D32)
                                    )
                                    Text(
                                        text = "Goals",
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                LeaderboardCategory.ASSISTS -> {
                                    Text(
                                        text = "${player.assists}",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF512DA8)
                                    )
                                    Text(
                                        text = "Assists",
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                LeaderboardCategory.CARDS_FOULS -> {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(text = "🟨 ${player.yellowCards}", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                        Text(text = "🟥 ${player.redCards}", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                    Text(
                                        text = "${player.fouls} Fouls",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                LeaderboardCategory.SAVES -> {
                                    Text(
                                        text = "${player.saves}",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF00838F)
                                    )
                                    Text(
                                        text = "Saves",
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                LeaderboardCategory.MARKET_VALUE -> {
                                    Text(
                                        text = "৳${player.purchasePrice}M",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF2E7D32)
                                    )
                                    Text(
                                        text = "Purchase Price",
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
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
