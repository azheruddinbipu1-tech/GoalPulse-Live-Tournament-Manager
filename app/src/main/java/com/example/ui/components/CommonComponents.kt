package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.model.EventType
import com.example.model.Position

@Composable
fun TeamBadge(
    logoUrl: String,
    teamName: String,
    shortName: String,
    primaryColorHex: Long = 0xFF1976D2,
    size: Dp = 44.dp,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(Color(primaryColorHex).copy(alpha = 0.15f))
            .border(1.5.dp, Color(primaryColorHex).copy(alpha = 0.4f), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        if (logoUrl.isNotBlank()) {
            AsyncImage(
                model = logoUrl,
                contentDescription = teamName,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
            )
        } else {
            Text(
                text = shortName.take(3).uppercase(),
                fontSize = (size.value * 0.35f).sp,
                fontWeight = FontWeight.Bold,
                color = Color(primaryColorHex),
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun PlayerAvatar(
    photoUrl: String,
    playerName: String,
    position: Position? = null,
    jerseyNumber: Int? = null,
    size: Dp = 46.dp,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        if (photoUrl.isNotBlank()) {
            AsyncImage(
                model = photoUrl,
                contentDescription = playerName,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
            )
        } else {
            val initials = playerName.split(" ")
                .filter { it.isNotBlank() }
                .take(2)
                .map { it.first().uppercase() }
                .joinToString("")
                .ifEmpty { "P" }

            Text(
                text = initials,
                fontSize = (size.value * 0.38f).sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }

        // Position pill badge
        if (position != null) {
            val posColor = when (position) {
                Position.GOALKEEPER -> Color(0xFFE65100)
                Position.DEFENDER -> Color(0xFF1565C0)
                Position.MIDFIELDER -> Color(0xFF2E7D32)
                Position.FORWARD -> Color(0xFFC62828)
            }
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .offset(x = 2.dp, y = 2.dp)
                    .background(posColor, CircleShape)
                    .padding(horizontal = 4.dp, vertical = 1.dp)
            ) {
                Text(
                    text = position.shortCode,
                    color = Color.White,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun LivePulsingBadge(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFFD32F2F).copy(alpha = alpha * 0.2f),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFD32F2F).copy(alpha = alpha)),
        modifier = modifier
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(7.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFD32F2F))
            )
            Text(
                text = "LIVE",
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                color = Color(0xFFD32F2F),
                letterSpacing = 0.8.sp
            )
        }
    }
}

@Composable
fun EventTypeChip(type: EventType, modifier: Modifier = Modifier) {
    val (bgColor, textColor) = when (type) {
        EventType.GOAL, EventType.PENALTY_GOAL -> Color(0xFFE8F5E9) to Color(0xFF2E7D32)
        EventType.OWN_GOAL -> Color(0xFFFFEBEE) to Color(0xFFC62828)
        EventType.YELLOW_CARD -> Color(0xFFFFF9C4) to Color(0xFFF57F17)
        EventType.RED_CARD, EventType.SECOND_YELLOW_RED -> Color(0xFFFFEBEE) to Color(0xFFD32F2F)
        EventType.FOUL -> Color(0xFFECEFF1) to Color(0xFF37474F)
        EventType.SAVE -> Color(0xFFE0F7FA) to Color(0xFF00838F)
        EventType.ASSIST -> Color(0xFFEDE7F6) to Color(0xFF512DA8)
        EventType.SUBSTITUTION -> Color(0xFFF3E5F5) to Color(0xFF6A1B9A)
        EventType.PENALTY_MISSED -> Color(0xFFFFEBEE) to Color(0xFF880E4F)
    }

    Surface(
        shape = RoundedCornerShape(8.dp),
        color = bgColor,
        modifier = modifier
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(text = type.icon, fontSize = 12.sp)
            Text(
                text = type.label,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = textColor
            )
        }
    }
}

@Composable
fun AdminPinDialog(
    isOpen: Boolean,
    onDismiss: () -> Unit,
    onPinSuccess: () -> Unit,
    verifyPin: (String) -> Boolean
) {
    if (!isOpen) return

    var pinInput by remember { mutableStateOf("") }
    var isError by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.Lock, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Text("Admin Authentication", fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    "Enter tournament official PIN to unlock Match Event controller, Team budget and Player management.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                OutlinedTextField(
                    value = pinInput,
                    onValueChange = {
                        pinInput = it.filter { char -> char.isDigit() }.take(6)
                        isError = false
                    },
                    label = { Text("Admin PIN (Default: 1234)") },
                    placeholder = { Text("1234") },
                    isError = isError,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                if (isError) {
                    Text(
                        "Incorrect PIN. Try default '1234'",
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 12.sp
                    )
                }

                // Quick test unlock button
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            pinInput = "1234"
                            isError = false
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            Icons.Default.Key,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            "Tap to autofill default PIN (1234)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (verifyPin(pinInput)) {
                        onPinSuccess()
                    } else {
                        isError = true
                    }
                }
            ) {
                Text("Unlock Admin")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
