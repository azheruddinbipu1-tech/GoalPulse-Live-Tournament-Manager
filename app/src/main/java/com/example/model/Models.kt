package com.example.model

enum class Position(val displayName: String, val shortCode: String) {
    GOALKEEPER("Goalkeeper", "GK"),
    DEFENDER("Defender", "DEF"),
    MIDFIELDER("Midfielder", "MID"),
    FORWARD("Forward", "FWD")
}

data class Player(
    val id: String,
    val teamId: String,
    val name: String,
    val jerseyNumber: Int,
    val position: Position,
    val photoUrl: String = "",
    val purchasePrice: Double = 0.0, // In Millions (e.g. 25.5M)
    val nationality: String = "Bangladesh",
    val goals: Int = 0,
    val assists: Int = 0,
    val yellowCards: Int = 0,
    val redCards: Int = 0,
    val fouls: Int = 0,
    val saves: Int = 0,
    val matchesPlayed: Int = 0
)

data class Team(
    val id: String,
    val name: String,
    val shortName: String,
    val logoUrl: String = "",
    val primaryColorHex: Long = 0xFF1E88E5,
    val totalBudget: Double = 100.0, // In Millions (e.g. $100.0M)
    val city: String = "",
    val coach: String = ""
) {
    fun getSpentBudget(players: List<Player>): Double {
        return players.filter { it.teamId == id }.sumOf { it.purchasePrice }
    }

    fun getRemainingBudget(players: List<Player>): Double {
        val spent = getSpentBudget(players)
        return (totalBudget - spent).coerceAtLeast(0.0)
    }
}

enum class MatchStatus(val label: String) {
    UPCOMING("Upcoming"),
    LIVE_1ST_HALF("1st Half"),
    HALF_TIME("Half Time"),
    LIVE_2ND_HALF("2nd Half"),
    EXTRA_TIME("Extra Time"),
    FINISHED("Full Time (FT)")
}

enum class EventType(val label: String, val icon: String) {
    GOAL("Goal", "⚽"),
    PENALTY_GOAL("Penalty Goal", "⚽🎯"),
    OWN_GOAL("Own Goal", "⚽🔴"),
    ASSIST("Assist", "👟"),
    YELLOW_CARD("Yellow Card", "🟨"),
    RED_CARD("Red Card", "🟥"),
    SECOND_YELLOW_RED("2nd Yellow (Red)", "🟨🟥"),
    FOUL("Foul", "🛑"),
    SAVE("Goalkeeper Save", "🧤"),
    SUBSTITUTION("Substitution", "🔄"),
    PENALTY_MISSED("Penalty Missed", "❌")
}

data class MatchEvent(
    val id: String,
    val matchId: String,
    val type: EventType,
    val minute: Int,
    val teamId: String,
    val playerId: String,
    val playerName: String = "",
    val assistPlayerId: String? = null,
    val assistPlayerName: String? = null,
    val subOutPlayerId: String? = null,
    val subOutPlayerName: String? = null,
    val note: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

data class Match(
    val id: String,
    val homeTeamId: String,
    val awayTeamId: String,
    val homeScore: Int = 0,
    val awayScore: Int = 0,
    val status: MatchStatus = MatchStatus.UPCOMING,
    val currentMinute: Int = 0,
    val addedMinutes: Int = 0,
    val isClockRunning: Boolean = false,
    val venue: String = "National Stadium",
    val matchDate: String = "Today, 19:30",
    val round: String = "Matchday 1",
    val matchStoryNotes: String = "",
    val events: List<MatchEvent> = emptyList()
)

data class StandingRow(
    val teamId: String,
    val teamName: String,
    val shortName: String,
    val logoUrl: String,
    val played: Int,
    val won: Int,
    val drawn: Int,
    val lost: Int,
    val goalsFor: Int,
    val goalsAgainst: Int,
    val goalDifference: Int,
    val points: Int,
    val form: List<String> // e.g. ["W", "D", "W", "L", "W"]
)
