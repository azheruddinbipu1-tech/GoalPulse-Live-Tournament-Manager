package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.TournamentRepository
import com.example.ui.components.AdminPinDialog
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme

enum class AppTab(val title: String, val icon: ImageVector, val selectedIcon: ImageVector) {
    LIVE_MATCH("Live Match", Icons.Outlined.SportsSoccer, Icons.Filled.SportsSoccer),
    STANDINGS("Points Table", Icons.Outlined.EmojiEvents, Icons.Filled.EmojiEvents),
    LEADERBOARD("Leaderboard", Icons.Outlined.Leaderboard, Icons.Filled.Leaderboard),
    TEAMS_BUDGET("Clubs & Budget", Icons.Outlined.Groups, Icons.Filled.Groups),
    ADMIN_HUB("Admin Hub", Icons.Outlined.AdminPanelSettings, Icons.Filled.AdminPanelSettings)
}

class MainActivity : ComponentActivity() {
    private val repository = TournamentRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MainTournamentApp(repository = repository)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainTournamentApp(repository: TournamentRepository) {
    var selectedTab by remember { mutableStateOf(AppTab.LIVE_MATCH) }
    val isAdminMode by repository.isAdminMode.collectAsState()
    var showPinDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("⚽", fontSize = 16.sp)
                            }
                        }
                        Column {
                            Text(
                                text = "GoalPulse Live",
                                fontWeight = FontWeight.Black,
                                fontSize = 17.sp,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = "Super League Tournament",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                },
                actions = {
                    // Admin/Public Mode pill toggle
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isAdminMode) Color(0xFF2E7D32).copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isAdminMode) Color(0xFF2E7D32).copy(alpha = 0.5f) else MaterialTheme.colorScheme.outlineVariant
                        ),
                        modifier = Modifier
                            .clickable {
                                if (isAdminMode) {
                                    repository.setAdminMode(false)
                                } else {
                                    showPinDialog = true
                                }
                            }
                            .padding(end = 8.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                if (isAdminMode) Icons.Default.LockOpen else Icons.Default.Lock,
                                contentDescription = null,
                                tint = if (isAdminMode) Color(0xFF2E7D32) else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = if (isAdminMode) "ADMIN ON" else "PUBLIC",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                color = if (isAdminMode) Color(0xFF2E7D32) else MaterialTheme.colorScheme.onSurfaceVariant,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 6.dp
            ) {
                AppTab.entries.forEach { tab ->
                    val isSelected = selectedTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { selectedTab = tab },
                        icon = {
                            Icon(
                                imageVector = if (isSelected) tab.selectedIcon else tab.icon,
                                contentDescription = tab.title
                            )
                        },
                        label = {
                            Text(
                                text = tab.title,
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            indicatorColor = MaterialTheme.colorScheme.primaryContainer
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                AppTab.LIVE_MATCH -> LiveMatchScreen(repository = repository)
                AppTab.STANDINGS -> PointsTableScreen(repository = repository)
                AppTab.LEADERBOARD -> LeaderboardScreen(repository = repository)
                AppTab.TEAMS_BUDGET -> TeamsBudgetScreen(repository = repository)
                AppTab.ADMIN_HUB -> AdminHubScreen(
                    repository = repository,
                    onNavigateToLiveMatch = { matchId ->
                        repository.selectMatch(matchId)
                        selectedTab = AppTab.LIVE_MATCH
                    }
                )
            }
        }
    }

    AdminPinDialog(
        isOpen = showPinDialog,
        onDismiss = { showPinDialog = false },
        onPinSuccess = {
            repository.setAdminMode(true)
            showPinDialog = false
        },
        verifyPin = { repository.verifyPin(it) }
    )
}
