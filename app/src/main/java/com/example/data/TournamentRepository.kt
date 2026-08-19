package com.example.data

import com.example.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class TournamentRepository {

    private val _teams = MutableStateFlow<List<Team>>(SampleData.initialTeams)
    val teams: StateFlow<List<Team>> = _teams.asStateFlow()

    private val _players = MutableStateFlow<List<Player>>(SampleData.initialPlayers)
    val players: StateFlow<List<Player>> = _players.asStateFlow()

    private val _matches = MutableStateFlow<List<Match>>(SampleData.initialMatches)
    val matches: StateFlow<List<Match>> = _matches.asStateFlow()

    private val _selectedMatchId = MutableStateFlow<String>(SampleData.initialMatches.first().id)
    val selectedMatchId: StateFlow<String> = _selectedMatchId.asStateFlow()

    private val _isAdminMode = MutableStateFlow<Boolean>(false)
    val isAdminMode: StateFlow<Boolean> = _isAdminMode.asStateFlow()

    private val _adminPin = MutableStateFlow<String>("1234")
    val adminPin: StateFlow<String> = _adminPin.asStateFlow()

    fun selectMatch(matchId: String) {
        _selectedMatchId.value = matchId
    }

    fun setAdminMode(unlocked: Boolean) {
        _isAdminMode.value = unlocked
    }

    fun verifyPin(pin: String): Boolean {
        return pin == _adminPin.value
    }

    fun updatePin(newPin: String) {
        if (newPin.length >= 4) {
            _adminPin.value = newPin
        }
    }

    // ==========================================
    // MATCH CONTROL & LIVE EVENTS
    // ==========================================

    fun updateMatchClock(matchId: String, minute: Int, isRunning: Boolean? = null) {
        _matches.value = _matches.value.map { match ->
            if (match.id == matchId) {
                match.copy(
                    currentMinute = minute.coerceIn(0, 120),
                    isClockRunning = isRunning ?: match.isClockRunning
                )
            } else match
        }
    }

    fun updateMatchStatus(matchId: String, newStatus: MatchStatus) {
        _matches.value = _matches.value.map { match ->
            if (match.id == matchId) {
                val isRunning = when (newStatus) {
                    MatchStatus.LIVE_1ST_HALF, MatchStatus.LIVE_2ND_HALF, MatchStatus.EXTRA_TIME -> true
                    else -> false
                }
                val minute = when (newStatus) {
                    MatchStatus.UPCOMING -> 0
                    MatchStatus.LIVE_1ST_HALF -> match.currentMinute.coerceAtLeast(1)
                    MatchStatus.HALF_TIME -> 45
                    MatchStatus.LIVE_2ND_HALF -> match.currentMinute.coerceAtLeast(46)
                    MatchStatus.EXTRA_TIME -> 90
                    MatchStatus.FINISHED -> 90
                }
                match.copy(
                    status = newStatus,
                    isClockRunning = isRunning,
                    currentMinute = minute
                )
            } else match
        }
    }

    fun updateMatchStory(matchId: String, story: String) {
        _matches.value = _matches.value.map { match ->
            if (match.id == matchId) {
                match.copy(matchStoryNotes = story)
            } else match
        }
    }

    fun addMatchEvent(
        matchId: String,
        type: EventType,
        minute: Int,
        teamId: String,
        playerId: String,
        assistPlayerId: String? = null,
        subOutPlayerId: String? = null,
        note: String = ""
    ) {
        val player = _players.value.find { it.id == playerId }
        val playerName = player?.name ?: "Unknown Player"
        val assistPlayer = _players.value.find { it.id == assistPlayerId }
        val assistPlayerName = assistPlayer?.name
        val subOutPlayer = _players.value.find { it.id == subOutPlayerId }
        val subOutPlayerName = subOutPlayer?.name

        val newEvent = MatchEvent(
            id = "ev-" + UUID.randomUUID().toString().take(8),
            matchId = matchId,
            type = type,
            minute = minute,
            teamId = teamId,
            playerId = playerId,
            playerName = playerName,
            assistPlayerId = assistPlayerId,
            assistPlayerName = assistPlayerName,
            subOutPlayerId = subOutPlayerId,
            subOutPlayerName = subOutPlayerName,
            note = note,
            timestamp = System.currentTimeMillis()
        )

        // 1. Update Match score and event list
        _matches.value = _matches.value.map { match ->
            if (match.id == matchId) {
                var newHomeScore = match.homeScore
                var newAwayScore = match.awayScore

                when (type) {
                    EventType.GOAL, EventType.PENALTY_GOAL -> {
                        if (teamId == match.homeTeamId) newHomeScore += 1
                        else if (teamId == match.awayTeamId) newAwayScore += 1
                    }
                    EventType.OWN_GOAL -> {
                        // Own goal awards goal to the opponent
                        if (teamId == match.homeTeamId) newAwayScore += 1
                        else if (teamId == match.awayTeamId) newHomeScore += 1
                    }
                    else -> {}
                }

                match.copy(
                    homeScore = newHomeScore,
                    awayScore = newAwayScore,
                    currentMinute = maxOf(match.currentMinute, minute),
                    events = listOf(newEvent) + match.events
                )
            } else match
        }

        // 2. Update individual player stats
        _players.value = _players.value.map { p ->
            when {
                p.id == playerId -> {
                    when (type) {
                        EventType.GOAL, EventType.PENALTY_GOAL -> p.copy(goals = p.goals + 1)
                        EventType.YELLOW_CARD -> p.copy(yellowCards = p.yellowCards + 1)
                        EventType.RED_CARD -> p.copy(redCards = p.redCards + 1)
                        EventType.SECOND_YELLOW_RED -> p.copy(yellowCards = p.yellowCards + 1, redCards = p.redCards + 1)
                        EventType.FOUL -> p.copy(fouls = p.fouls + 1)
                        EventType.SAVE -> p.copy(saves = p.saves + 1)
                        else -> p
                    }
                }
                p.id == assistPlayerId && (type == EventType.GOAL || type == EventType.PENALTY_GOAL) -> {
                    p.copy(assists = p.assists + 1)
                }
                else -> p
            }
        }
    }

    /**
     * 🗑️ Event delete করলে গোলের score rollback
     * Deletes the event and automatically rolls back score and player statistics!
     */
    fun deleteMatchEvent(matchId: String, eventId: String) {
        val targetMatch = _matches.value.find { it.id == matchId } ?: return
        val targetEvent = targetMatch.events.find { it.id == eventId } ?: return

        // 1. Rollback Match Score
        _matches.value = _matches.value.map { match ->
            if (match.id == matchId) {
                var newHomeScore = match.homeScore
                var newAwayScore = match.awayScore

                when (targetEvent.type) {
                    EventType.GOAL, EventType.PENALTY_GOAL -> {
                        if (targetEvent.teamId == match.homeTeamId) {
                            newHomeScore = (newHomeScore - 1).coerceAtLeast(0)
                        } else if (targetEvent.teamId == match.awayTeamId) {
                            newAwayScore = (newAwayScore - 1).coerceAtLeast(0)
                        }
                    }
                    EventType.OWN_GOAL -> {
                        if (targetEvent.teamId == match.homeTeamId) {
                            newAwayScore = (newAwayScore - 1).coerceAtLeast(0)
                        } else if (targetEvent.teamId == match.awayTeamId) {
                            newHomeScore = (newHomeScore - 1).coerceAtLeast(0)
                        }
                    }
                    else -> {}
                }

                match.copy(
                    homeScore = newHomeScore,
                    awayScore = newAwayScore,
                    events = match.events.filter { it.id != eventId }
                )
            } else match
        }

        // 2. Rollback individual player stats
        _players.value = _players.value.map { p ->
            when {
                p.id == targetEvent.playerId -> {
                    when (targetEvent.type) {
                        EventType.GOAL, EventType.PENALTY_GOAL -> p.copy(goals = (p.goals - 1).coerceAtLeast(0))
                        EventType.YELLOW_CARD -> p.copy(yellowCards = (p.yellowCards - 1).coerceAtLeast(0))
                        EventType.RED_CARD -> p.copy(redCards = (p.redCards - 1).coerceAtLeast(0))
                        EventType.SECOND_YELLOW_RED -> p.copy(
                            yellowCards = (p.yellowCards - 1).coerceAtLeast(0),
                            redCards = (p.redCards - 1).coerceAtLeast(0)
                        )
                        EventType.FOUL -> p.copy(fouls = (p.fouls - 1).coerceAtLeast(0))
                        EventType.SAVE -> p.copy(saves = (p.saves - 1).coerceAtLeast(0))
                        else -> p
                    }
                }
                targetEvent.assistPlayerId != null && p.id == targetEvent.assistPlayerId &&
                        (targetEvent.type == EventType.GOAL || targetEvent.type == EventType.PENALTY_GOAL) -> {
                    p.copy(assists = (p.assists - 1).coerceAtLeast(0))
                }
                else -> p
            }
        }
    }

    // ==========================================
    // TEAM CRUD & BUDGET MANAGEMENT
    // ==========================================

    fun addTeam(team: Team) {
        _teams.value = _teams.value + team
    }

    fun updateTeam(team: Team) {
        _teams.value = _teams.value.map { if (it.id == team.id) team else it }
    }

    fun deleteTeam(teamId: String) {
        _teams.value = _teams.value.filter { it.id != teamId }
        _players.value = _players.value.filter { it.teamId != teamId }
        _matches.value = _matches.value.filter { it.homeTeamId != teamId && it.awayTeamId != teamId }
    }

    // ==========================================
    // PLAYER CRUD & TRANSFER VALUE
    // ==========================================

    fun addPlayer(player: Player) {
        _players.value = _players.value + player
    }

    fun updatePlayer(player: Player) {
        _players.value = _players.value.map { if (it.id == player.id) player else it }
    }

    fun deletePlayer(playerId: String) {
        _players.value = _players.value.filter { it.id != playerId }
    }

    // ==========================================
    // MATCH CRUD
    // ==========================================

    fun createMatch(
        homeTeamId: String,
        awayTeamId: String,
        venue: String,
        matchDate: String,
        round: String
    ): Match {
        val newMatch = Match(
            id = "match-" + UUID.randomUUID().toString().take(8),
            homeTeamId = homeTeamId,
            awayTeamId = awayTeamId,
            venue = venue,
            matchDate = matchDate,
            round = round,
            matchStoryNotes = "Tournament clash scheduled between both clubs.",
            events = emptyList()
        )
        _matches.value = _matches.value + newMatch
        return newMatch
    }

    fun deleteMatch(matchId: String) {
        _matches.value = _matches.value.filter { it.id != matchId }
        if (_selectedMatchId.value == matchId && _matches.value.isNotEmpty()) {
            _selectedMatchId.value = _matches.value.first().id
        }
    }

    fun resetToSampleData() {
        _teams.value = SampleData.initialTeams
        _players.value = SampleData.initialPlayers
        _matches.value = SampleData.initialMatches
        _selectedMatchId.value = SampleData.initialMatches.first().id
    }

    // ==========================================
    // STANDINGS (POINTS TABLE) CALCULATION
    // ==========================================

    fun calculateStandings(): List<StandingRow> {
        val currentTeams = _teams.value
        val allMatches = _matches.value

        return currentTeams.map { team ->
            var played = 0
            var won = 0
            var drawn = 0
            var lost = 0
            var goalsFor = 0
            var goalsAgainst = 0
            val form = mutableListOf<String>()

            // We evaluate finished matches and active live matches
            val teamMatches = allMatches.filter {
                (it.homeTeamId == team.id || it.awayTeamId == team.id) &&
                        it.status != MatchStatus.UPCOMING
            }

            for (m in teamMatches) {
                played++
                val isHome = m.homeTeamId == team.id
                val teamScore = if (isHome) m.homeScore else m.awayScore
                val opponentScore = if (isHome) m.awayScore else m.homeScore

                goalsFor += teamScore
                goalsAgainst += opponentScore

                if (teamScore > opponentScore) {
                    won++
                    form.add("W")
                } else if (teamScore == opponentScore) {
                    drawn++
                    form.add("D")
                } else {
                    lost++
                    form.add("L")
                }
            }

            val points = (won * 3) + (drawn * 1)
            val gd = goalsFor - goalsAgainst

            StandingRow(
                teamId = team.id,
                teamName = team.name,
                shortName = team.shortName,
                logoUrl = team.logoUrl,
                played = played,
                won = won,
                drawn = drawn,
                lost = lost,
                goalsFor = goalsFor,
                goalsAgainst = goalsAgainst,
                goalDifference = gd,
                points = points,
                form = form.takeLast(5)
            )
        }.sortedWith(
            compareByDescending<StandingRow> { it.points }
                .thenByDescending { it.goalDifference }
                .thenByDescending { it.goalsFor }
                .thenBy { it.teamName }
        )
    }
}
