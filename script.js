let currentAction = '';
let currentMode = '';
let currentDefinition = '';
let currentPlayer = '';
let secondPlayer = '';
let actionsLog = [];

let team1Goals = 0;
let team1Points = 0;
let team2Goals = 0;
let team2Points = 0;

let marker1 = { x: null, y: null };
let marker2 = { x: null, y: null };
let firstMarkerConfirmed = false;

// Global arc variables for coordinate validation
let arcTop = null;
let arcBottom = null;

// Our Team Player Names
let playerNames = {
    1: '#1 - GK',
    2: '#2 - LCNB',
    3: '#3 - FB',
    4: '#4 - RCNB',
    5: '#5 - LWB',
    6: '#6 - CTB',
    7: '#7 - RWB',
    8: '#8 - MF',
    9: '#9 - MF',
    10: '#10 - LWF',
    11: '#11 - CTF',
    12: '#12 - RWF',
    13: '#13 - LCNF',
    14: '#14 - FF',
    15: '#15 - RCNF',
    16: '#16 - SUB 1',
    17: '#17 - SUB 2',
    18: '#18 - SUB 3',
    19: '#19 - SUB 4',
    20: '#20 - SUB 5',
    21: '#21 - SUB 6',
    22: '#22 - SUB 7',
    23: '#23 - SUB 8',
    24: '#24 - SUB 9',
    25: '#25 - SUB 10',
    26: '#26 - SUB 11',
    27: '#27 - SUB 12',
    28: '#28 - SUB 13',
    29: '#29 - SUB 14',
    30: '#30 - SUB 15'
};

// Opposition Player Names (using 100+ IDs to avoid conflicts)
let oppositionPlayerNames = {
    101: '#1 - GK',
    102: '#2 - LCNB',
    103: '#3 - FB',
    104: '#4 - RCNB',
    105: '#5 - LWB',
    106: '#6 - CTB',
    107: '#7 - RWB',
    108: '#8 - MF',
    109: '#9 - MF',
    110: '#10 - LWF',
    111: '#11 - CTF',
    112: '#12 - RWF',
    113: '#13 - LCNF',
    114: '#14 - FF',
    115: '#15 - RCNF',
    116: '#16 - SUB 1',
    117: '#17 - SUB 2',
    118: '#18 - SUB 3',
    119: '#19 - SUB 4',
    120: '#20 - SUB 5',
    121: '#21 - SUB 6',
    122: '#22 - SUB 7',
    123: '#23 - SUB 8',
    124: '#24 - SUB 9',
    125: '#25 - SUB 10',
    126: '#26 - SUB 11',
    127: '#27 - SUB 12',
    128: '#28 - SUB 13',
    129: '#29 - SUB 14',
    130: '#30 - SUB 15'
};

// Current team view state
let currentTeamView = 'our-team';

// Summary view state
let currentSummaryView = 'timeline';

// Team customization data
let teamCustomizations = {
    1: {
        pattern: 'solid',
        primaryColor: '#2563eb',
        secondaryColor: '#1d4ed8',
        hasSecondary: true
    },
    2: {
        pattern: 'solid',
        primaryColor: '#6b7280',
        secondaryColor: '#4b5563',
        hasSecondary: true
    }
};

let currentEditingTeam = null;

let coordinatesEnabled = false;
let gridEnabled = false; // GRID mode toggle
let gridSelectionActive = false; // true when coordinate screen is used for GRID
let selectedGrid = null; // currently selected GRID id (e.g., GRID12)

let currentCoordinates1 = '';
let currentCoordinates2 = '';

let isDragging = false; // Tracks whether a drag is in progress
let dragSourceIndex = null; // The player being dragged

let touchStartTime = 0; // Used to detect tap vs drag
let touchStartIndex = null;
let touchStartX = 0;
let touchStartY = 0;
const MOVE_THRESHOLD = 10; // pixels to distinguish drag from tap

let noteRowIndex = null;
let tempNoteContent = '';
let editingMode = false;

let filters = {
    player: null,
    action: null,
    definition: null,
    mode: null
};

document.addEventListener('DOMContentLoaded', function () {
    updateCounters();
    updatePlayerLabels();
    addDragAndTouchEventsToPlayerButtons(); // <--- Enable drag-and-drop and touch
    filterActions();
    
    // Initialize team view
    switchTeamView('our-team');
    
    // Initialize Match Log team names
    updateMatchLogTeamNames();
    
    // Load and apply team designs
    loadAndApplyTeamDesigns();
    
    // Initialize dark mode
    initializeDarkMode();
    
    // Initialize Match Log action button styling (after dark mode is set)
    updateMatchLogActionButtonBorders();
    
    // Ensure colors are correct when page becomes visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            updateAllActionButtonColors();
        }
    });

    // Initialize settings popup toggles to current state if present
    syncToggleViews();
    
    // Initialize stats subtab navigation
    initStatsSubtabNavigation();
});

// Dark Mode Toggle
function toggleDarkMode(forcedState) {
    // Determine target state
    let isDarkMode = forcedState;
    if (typeof isDarkMode === 'undefined') {
        const settingsDark = document.getElementById('settings-toggle-dark-mode');
        const headerDark = document.getElementById('toggle-dark-mode');
        if (settingsDark) isDarkMode = settingsDark.checked;
        else if (headerDark) isDarkMode = headerDark.checked;
        else isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ? false : true; // toggle
    }

    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('darkMode', 'false');
    }

    // sync checkboxes
    const settingsDark = document.getElementById('settings-toggle-dark-mode');
    const headerDark = document.getElementById('toggle-dark-mode');
    if (settingsDark) settingsDark.checked = isDarkMode;
    if (headerDark) headerDark.checked = isDarkMode;

    // Update all action button colors when dark mode changes
    updateAllActionButtonColors();
}

// Initialize dark mode on page load
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('darkMode');
    const isDark = savedTheme === 'true';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    // sync both toggles if present
    const settingsDark = document.getElementById('settings-toggle-dark-mode');
    const headerDark = document.getElementById('toggle-dark-mode');
    if (settingsDark) settingsDark.checked = isDark;
    if (headerDark) headerDark.checked = isDark;
}

// GRID toggle (mutually exclusive with coordinates)
function toggleGrid() {
    const settingsGrid = document.getElementById('settings-toggle-grid');
    const headerGrid = document.getElementById('toggle-grid');
    const isChecked = settingsGrid ? settingsGrid.checked : (headerGrid ? headerGrid.checked : false);
    gridEnabled = !!isChecked;
    if (gridEnabled) {
        coordinatesEnabled = false;
        const coordsToggle = document.getElementById('toggle-coordinates');
        if (coordsToggle) coordsToggle.checked = false;
        const settingsCoords = document.getElementById('settings-toggle-coordinates');
        if (settingsCoords) settingsCoords.checked = false;
        document.body.classList.add('grid-mode');
    } else {
        document.body.classList.remove('grid-mode');
    }
    syncToggleViews();
}

// =========================
// Central Match Timer
// =========================
const TimerStorageKey = 'matchTimerState:v2';
const TimerPhases = [
	{ key: 'PREMATCH', label: 'Pre-Match', passive: true },
	{ key: 'H1', label: '1st Half' },
	{ key: 'HT', label: 'Half-Time', passive: true },
	{ key: 'H2', label: '2nd Half' },
	{ key: 'FT', label: 'Full Time', passive: true },
	{ key: 'ET1', label: 'Extra Time 1' },
	{ key: 'ET1_HT', label: 'Halftime ET', passive: true },
	{ key: 'ET2', label: 'Extra Time 2' },
	{ key: 'FTET', label: 'Full Time ET', passive: true },
	{ key: 'FINISHED', label: 'Match Finished', terminal: true }
];

class TimerController {
	constructor() {
		this.state = {
			phaseIndex: -1,
			isRunning: false,
			startEpochMs: null,
			elapsedMs: 0,
			pausedAccumMs: 0,
			lastPauseStartMs: null
		};
		this.clockEl = null;
		this.phaseLabelEl = null;
		this.phaseBtn = null;
		this.pauseBtn = null;
		this.tray = null;
		this.trayToggle = null;
		this.trayNextBtn = null;
		this.rafId = null;
		this.lastRenderSec = null;
		this.boundOutsideHandler = null;
	}

	init() {
		this.clockEl = document.getElementById('timer-clock');
		this.phaseLabelEl = document.getElementById('timer-phase-label');
		this.pauseBtn = document.getElementById('timer-pause-btn');
		this.tray = document.getElementById('timer-tray');
		this.trayToggle = document.getElementById('timer-tray-toggle');
		this.trayNextBtn = document.getElementById('tray-next-phase');
		if (!this.clockEl || !this.pauseBtn || !this.tray || !this.trayToggle) return;

		this.load();
		// Default to PREMATCH if no phase yet
		if (this.state.phaseIndex < 0) {
			this.state.phaseIndex = TimerPhases.findIndex(p => p.key === 'PREMATCH');
			this.state.isRunning = false;
			this.state.elapsedMs = 0;
			this.state.startEpochMs = null;
			this.state.pausedAccumMs = 0;
			this.state.lastPauseStartMs = null;
		}
		this.updateUI(true);
		this.bindEvents();
		this.startRenderLoop();
	}

	bindEvents() {
		this.pauseBtn.addEventListener('click', () => this.onPauseResume());
		this.trayToggle.addEventListener('click', () => this.toggleTray());
		document.getElementById('tray-reset')?.addEventListener('click', () => this.openResetPopup());
		document.getElementById('tray-edit-time')?.addEventListener('click', () => this.openEditTimePopup());
		document.getElementById('tray-edit-phase')?.addEventListener('click', () => this.openEditPhasePopup());
		document.getElementById('tray-next-phase')?.addEventListener('click', () => this.triggerNextPhase());
		document.getElementById('tray-end-match')?.addEventListener('click', () => this.openEndMatchPopup());

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.trayOpen()) this.closeTray();
		});
	}

	startRenderLoop() {
		const loop = () => {
			this.renderClock();
			this.rafId = window.requestAnimationFrame(loop);
		};
		this.rafId = window.requestAnimationFrame(loop);
	}

	renderClock() {
		if (!this.clockEl) return;
		const elapsed = this.getElapsedMs();
		const totalSeconds = Math.floor(elapsed / 1000);
		if (totalSeconds === this.lastRenderSec) return;
		this.lastRenderSec = totalSeconds;
		this.clockEl.textContent = this.formatTime(totalSeconds);
	}

	getElapsedMs() {
		// If never started
		if (this.state.startEpochMs === null && this.state.elapsedMs === 0 && !this.state.isRunning) {
			return 0;
		}
		// Running: base + delta
		if (this.state.isRunning && this.state.startEpochMs) {
			const now = Date.now();
			return this.state.elapsedMs + (now - this.state.startEpochMs);
		}
		// Paused: show snapshot
		return this.state.elapsedMs;
	}

	formatTime(totalSeconds) {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		const mm = String(minutes).padStart(2, '0');
		const ss = String(seconds).padStart(2, '0');
		if (hours > 0) {
			const hh = String(hours).padStart(2, '0');
			return `${hh}:${mm}:${ss}`;
		}
		return `${mm}:${ss}`;
	}

	onPhaseButton() {
		const next = this.nextPhaseIndex();
		const nextLabel = TimerPhases[next]?.label || 'Start 1st Half';
		if (!window.confirm(`Proceed: ${nextLabel}?`)) return;
		this.closeTray();

		const currentPhase = TimerPhases[this.state.phaseIndex]?.key || null;
		this.state.phaseIndex = next;
		this.state.elapsedMs = 0;
		this.state.pausedAccumMs = 0;
		this.state.lastPauseStartMs = null;
		this.state.startEpochMs = Date.now();
		this.state.isRunning = !TimerPhases[next]?.passive && !TimerPhases[next]?.terminal;

		this.logEvent('phase_change', { phase: TimerPhases[next]?.label || 'Unknown', from: currentPhase });
		this.save();
		this.updateUI(true);
	}

	nextPhaseIndex() {
		const idx = this.state.phaseIndex;
		if (idx < 0) return 0; // Start 1st Half
		if (idx >= TimerPhases.length - 1) return idx; // Finished
		return idx + 1;
	}

	onPauseResume() {
		const phaseKey = this.currentPhaseKey();
		// If ball-state phases: PREMATCH, HT, FT, ET1_HT, FTET -> start next run phase
		if (phaseKey === 'PREMATCH') return this.startPhase('H1', 'First Half Started');
		if (phaseKey === 'HT') return this.startPhase('H2', 'Second Half Started');
		if (phaseKey === 'FT') return this.startPhase('ET1', 'First Half Extra Time Started');
		if (phaseKey === 'ET1_HT') return this.startPhase('ET2', 'Second Half Extra Time Started');
		if (phaseKey === 'FTET') return; // Finished ET - no start via main button

		if (this.state.isRunning) {
			// Snapshot elapsed time at pause for stable display
			const nowElapsed = this.getElapsedMs();
			this.state.elapsedMs = Math.max(0, nowElapsed);
			this.state.startEpochMs = null;
			this.state.pausedAccumMs = 0;
			this.state.lastPauseStartMs = null;
			this.state.isRunning = false;
			this.logEvent('pause', {});
			this.save();
			this.updateUI(true);
		} else {
			// Resume from snapshot
			this.state.startEpochMs = Date.now();
			this.state.pausedAccumMs = 0;
			this.state.lastPauseStartMs = null;
			this.state.isRunning = true;
			this.logEvent('resume', {});
			this.save();
			this.updateUI(true);
		}
	}

	currentPhaseKey() {
		if (this.state.phaseIndex < 0) return 'PREMATCH';
		return TimerPhases[this.state.phaseIndex]?.key || 'PREMATCH';
	}

	setPhase(key, running = false) {
		const index = TimerPhases.findIndex(p => p.key === key);
		if (index === -1) return;
		this.state.phaseIndex = index;
		this.state.isRunning = running;
		this.state.elapsedMs = 0;
		this.state.pausedAccumMs = 0;
		this.state.lastPauseStartMs = null;
		this.state.startEpochMs = running ? Date.now() : null;
		this.save();
		this.updateUI(true);
	}

	startPhase(key, toastMsg) {
		this.setPhase(key, true);
		this.logEvent('start', { phase: TimerPhases[this.state.phaseIndex]?.label });
		TimerController.showToast(toastMsg);
	}

	endToPhase(key, toastMsg) {
		// Move to a non-running state and reset
		this.setPhase(key, false);
		this.logEvent('phase_end', { to: TimerPhases[this.state.phaseIndex]?.label });
		TimerController.showToast(toastMsg);
	}

	triggerNextPhase() {
		const phaseKey = this.currentPhaseKey();
		switch (phaseKey) {
			case 'PREMATCH':
				this.startPhase('H1', 'First Half Started');
				break;
			case 'H1':
				this.endToPhase('HT', 'First Half Ended');
				break;
			case 'HT':
				this.startPhase('H2', 'Second Half Started');
				break;
			case 'H2':
				this.endToPhase('FT', 'Second Half Ended');
				break;
			case 'FT':
				this.startPhase('ET1', 'First Half Extra Time Started');
				break;
			case 'ET1':
				this.endToPhase('ET1_HT', 'First Half Extra Time Ended');
				break;
			case 'ET1_HT':
				this.startPhase('ET2', 'Second Half Extra Time Started');
				break;
			case 'ET2':
				this.endToPhase('FTET', 'Second Half ET Ended');
				break;
			case 'FTET':
			case 'FINISHED':
				// no-op
				break;
		}
		this.closeTray();
	}

	confirmReset() {
		this.state.elapsedMs = 0;
		this.state.startEpochMs = Date.now();
		this.state.pausedAccumMs = 0;
		this.state.lastPauseStartMs = null;
		this.logEvent('reset', {});
		this.save();
		this.updateUI();
		this.closeTray();
	}

	confirmFinish() {
		this.state.phaseIndex = TimerPhases.findIndex(p => p.key === 'FINISHED');
		this.state.isRunning = false;
		this.logEvent('finish', {});
		this.save();
		this.updateUI();
		this.closeTray();
	}

	openResetPopup() {
		const popup = document.getElementById('timer-reset-popup');
		if (!popup) return;
		const confirmBtn = document.getElementById('timer-reset-confirm');
		if (confirmBtn) {
			confirmBtn.onclick = () => {
				this.confirmReset();
				PopupAnimator.hidePopup(popup, 'standard');
			};
		}
		PopupAnimator.showPopup(popup, 'standard');
	}

	openEditTimePopup() {
		const popup = document.getElementById('timer-edit-time-popup');
		if (!popup) return;
		const input = document.getElementById('timer-edit-time-input');
		if (input) {
			// Pre-fill with current time
			const seconds = Math.floor(this.getElapsedMs() / 1000);
			input.value = this.formatTime(seconds);
		}
		const confirmBtn = document.getElementById('timer-edit-time-confirm');
		if (confirmBtn) {
			confirmBtn.onclick = () => {
				const value = (document.getElementById('timer-edit-time-input')?.value || '').trim();
				if (!value) {
					PopupAnimator.hidePopup(popup, 'standard');
					return;
				}
				const parts = value.split(':').map(v => parseInt(v, 10)).filter(n => !isNaN(n));
				let seconds = 0;
				if (parts.length === 2) {
					seconds = parts[0] * 60 + parts[1];
				} else if (parts.length === 3) {
					seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
				} else {
					PopupAnimator.hidePopup(popup, 'standard');
					return;
				}
				this.state.elapsedMs = seconds * 1000;
				this.state.startEpochMs = Date.now();
				this.state.pausedAccumMs = 0;
				this.state.lastPauseStartMs = null;
				this.logEvent('adjust', { to: value });
				this.save();
				this.updateUI(true);
				PopupAnimator.hidePopup(popup, 'standard');
				this.closeTray();
			};
		}
		PopupAnimator.showPopup(popup, 'standard');
	}

	openEndMatchPopup() {
		const popup = document.getElementById('timer-end-match-popup');
		if (!popup) return;
		const confirmBtn = document.getElementById('timer-end-match-confirm');
		if (confirmBtn) {
			confirmBtn.onclick = () => {
				this.confirmFinish();
				PopupAnimator.hidePopup(popup, 'standard');
			};
		}
		PopupAnimator.showPopup(popup, 'standard');
	}

	openEditPhasePopup() {
		const popup = document.getElementById('timer-edit-phase-popup');
		if (!popup) return;
		// Attach click handlers to each phase button
		popup.querySelectorAll('.popup-menu-button[data-phase-key]').forEach(btn => {
			btn.onclick = () => {
				const key = btn.getAttribute('data-phase-key');
				this.applyPhaseChangeByKey(key);
				PopupAnimator.hidePopup(popup, 'standard');
				this.closeTray();
			};
		});
		PopupAnimator.showPopup(popup, 'standard');
	}

	applyPhaseChangeByKey(key) {
		const index = TimerPhases.findIndex(p => p.key === key);
		if (index === -1) return;
		this.state.phaseIndex = index;
		// Pause and reset to 00:00
		this.state.isRunning = false;
		this.state.elapsedMs = 0;
		this.state.pausedAccumMs = 0;
		this.state.lastPauseStartMs = null;
		this.state.startEpochMs = null;
		this.logEvent('phase_set', { phase: TimerPhases[index]?.label || key });
		this.save();
		this.updateUI(true);
	}

	addMarker() {
		this.logEvent('marker', {});
		this.closeTray();
	}

	trayOpen() {
		return this.tray.classList.contains('open');
	}

	toggleTray() {
		if (this.trayOpen()) this.closeTray();
		else this.openTray();
	}

	openTray() {
		this.tray.classList.add('open');
		this.tray.setAttribute('aria-hidden', 'false');
		this.trayToggle.setAttribute('aria-expanded', 'true');
		this.trapFocus(true);
		// outside click close (anywhere not inside tray or on toggle)
		this.boundOutsideHandler = (e) => {
			const clickedInsideTray = this.tray.contains(e.target);
			const clickedToggle = e.target === this.trayToggle || this.trayToggle.contains?.(e.target);
			if (!clickedInsideTray && !clickedToggle) {
				this.closeTray();
			}
		};
		setTimeout(() => document.addEventListener('click', this.boundOutsideHandler, { once: true }), 0);
	}

	closeTray() {
		this.tray.classList.remove('open');
		this.tray.setAttribute('aria-hidden', 'true');
		this.trayToggle.setAttribute('aria-expanded', 'false');
		this.trapFocus(false);
		this.trayToggle.focus();
	}

	trapFocus(enable) {
		const focusable = this.tray.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
		if (!enable) {
			focusable.forEach(el => el.removeAttribute('data-trap'));
			return;
		}
		const list = Array.from(focusable);
		if (list.length === 0) return;
		this.tray.querySelector('.timer-tray-inner')?.setAttribute('tabindex', '-1');
		this.tray.querySelector('.timer-tray-inner')?.focus();
		const first = list[0];
		const last = list[list.length - 1];
		const onKeyDown = (e) => {
			if (e.key !== 'Tab') return;
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		this.tray.addEventListener('keydown', onKeyDown, { once: true });
	}

	updateUI(force = false) {
		const label = this.currentPhaseLabel();
		if (this.phaseLabelEl) {
			this.phaseLabelEl.textContent = label || 'Ready';
			this.phaseLabelEl.setAttribute('aria-hidden', label ? 'false' : 'true');
		}
		if (this.pauseBtn) {
			const phaseKey = this.currentPhaseKey();
			this.pauseBtn.style.display = 'inline-block';
			this.pauseBtn.innerHTML = '';
			if (phaseKey === 'PREMATCH' || phaseKey === 'HT' || phaseKey === 'FT' || phaseKey === 'ET1_HT' || phaseKey === 'FTET') {
				this.pauseBtn.setAttribute('aria-label', 'Start phase');
				this.pauseBtn.appendChild(TimerController.buildGaelicBallIcon());
				this.pauseBtn.classList.remove('running');
				this.pauseBtn.classList.add('paused');
			} else {
				// Running/resumable phases
				const actionLabel = this.state.isRunning ? 'Pause timer' : 'Resume timer';
				this.pauseBtn.setAttribute('aria-label', actionLabel);
				this.pauseBtn.appendChild(this.state.isRunning ? TimerController.buildPauseIcon() : TimerController.buildPlayWithBarIcon());
				this.pauseBtn.classList.toggle('running', this.state.isRunning);
				this.pauseBtn.classList.toggle('paused', !this.state.isRunning);
			}
		}
		// Update tray next-phase button text dynamically
		if (this.trayNextBtn) {
			const phaseKey = this.currentPhaseKey();
			let text = 'Next';
			switch (phaseKey) {
				case 'PREMATCH': text = 'Begin First Half'; break;
				case 'H1': text = 'Halftime'; break;
				case 'HT': text = 'Begin Second Half'; break;
				case 'H2': text = 'Full Time'; break;
				case 'FT': text = 'Begin First Half ET'; break;
				case 'ET1': text = 'Halftime ET'; break;
				case 'ET1_HT': text = 'Begin Second Half ET'; break;
				case 'ET2': text = 'Full Time ET'; break;
				case 'FTET': text = 'Match Finished'; break;
				default: text = 'Next'; break;
			}
			this.trayNextBtn.textContent = text;
		}
		if (force) this.renderClock();
	}

	currentPhaseLabel() {
		if (this.state.phaseIndex < 0) return '';
		return TimerPhases[this.state.phaseIndex]?.label || '';
	}

	save() {
		try {
			localStorage.setItem(TimerStorageKey, JSON.stringify(this.state));
		} catch {}
	}

	load() {
		try {
			const raw = localStorage.getItem(TimerStorageKey);
			if (!raw) return;
			const parsed = JSON.parse(raw);
			this.state = Object.assign(this.state, parsed || {});
		} catch {}
	}

	logEvent(type, extra) {
		try {
			const elapsed = Math.floor(this.getElapsedMs() / 1000);
			const entry = {
				type: `timer:${type}`,
				phase: this.currentPhaseLabel(),
				elapsed: this.formatTime(elapsed),
				utc: new Date().toISOString(),
				...extra
			};
			if (Array.isArray(window.actionsLog)) {
				window.actionsLog.push({ action: 'Timer', details: entry, timestamp: Date.now() });
				if (typeof updateSummary === 'function') updateSummary();
			}
		} catch {}
	}
}

// Icon builders
TimerController.buildPauseIcon = function() {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('aria-hidden', 'true');
	const left = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	left.setAttribute('x', '6');
	left.setAttribute('y', '4');
	left.setAttribute('width', '4');
	left.setAttribute('height', '16');
	const right = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	right.setAttribute('x', '14');
	right.setAttribute('y', '4');
	right.setAttribute('width', '4');
	right.setAttribute('height', '16');
	svg.appendChild(left);
	svg.appendChild(right);
	return svg;
};

// Gaelic football icon (bold stitched ball)
TimerController.buildGaelicBallIcon = function() {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('aria-hidden', 'true');
	// Outer circle of ball
	const outer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	outer.setAttribute('cx', '12');
	outer.setAttribute('cy', '12');
	outer.setAttribute('r', '9.5');
	outer.setAttribute('fill', 'none');
	outer.setAttribute('stroke', 'currentColor');
	outer.setAttribute('stroke-width', '2');

	// Horizontal seam
	const seamH = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	seamH.setAttribute('d', 'M3.5 12c2.7 1.9 5.7 2.9 8.5 2.9 2.8 0 5.8-1 8.5-2.9');
	seamH.setAttribute('fill', 'none');
	seamH.setAttribute('stroke', 'currentColor');
	seamH.setAttribute('stroke-width', '1.6');
	seamH.setAttribute('stroke-linecap', 'round');

	// Vertical seam
	const seamV = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	seamV.setAttribute('d', 'M12 3.5c1.9 2.7 2.9 5.7 2.9 8.5s-1 5.8-2.9 8.5');
	seamV.setAttribute('fill', 'none');
	seamV.setAttribute('stroke', 'currentColor');
	seamV.setAttribute('stroke-width', '1.6');
	seamV.setAttribute('stroke-linecap', 'round');

	// Diagonal seams to mimic stitched panels
	const seamDiagLeft = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	seamDiagLeft.setAttribute('d', 'M6.4 5.7c1.9 1.6 3.2 3.6 3.6 6.3-.4 2.7-1.7 4.7-3.6 6.3');
	seamDiagLeft.setAttribute('fill', 'none');
	seamDiagLeft.setAttribute('stroke', 'currentColor');
	seamDiagLeft.setAttribute('stroke-width', '1.3');
	seamDiagLeft.setAttribute('stroke-linecap', 'round');

	const seamDiagRight = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	seamDiagRight.setAttribute('d', 'M17.6 5.7c-1.9 1.6-3.2 3.6-3.6 6.3.4 2.7 1.7 4.7 3.6 6.3');
	seamDiagRight.setAttribute('fill', 'none');
	seamDiagRight.setAttribute('stroke', 'currentColor');
	seamDiagRight.setAttribute('stroke-width', '1.3');
	seamDiagRight.setAttribute('stroke-linecap', 'round');

	svg.appendChild(outer);
	svg.appendChild(seamH);
	svg.appendChild(seamV);
	svg.appendChild(seamDiagLeft);
	svg.appendChild(seamDiagRight);
	return svg;
};

// Toast helper using existing fade-message element
TimerController.showToast = function(message) {
	const el = document.getElementById('coordinate-warning');
	if (!el) return;
	el.textContent = message;
	el.classList.add('show');
	setTimeout(() => {
		el.classList.remove('show');
	}, 1500);
};

// Play icon with a leading bar at the left (same height as triangle)
TimerController.buildPlayWithBarIcon = function() {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('aria-hidden', 'true');
	// Leading bar
	const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	bar.setAttribute('x', '3');
	bar.setAttribute('y', '4');
	bar.setAttribute('width', '3');
	bar.setAttribute('height', '16');
	// Triangle play
	const tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
	// Triangle points roughly centered, rightward pointing
	tri.setAttribute('points', '8,4 20,12 8,20');
	svg.appendChild(bar);
	svg.appendChild(tri);
	return svg;
};

// Initialize timer once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	try {
		window.__timerController = new TimerController();
		window.__timerController.init();
	} catch {}
});

document.addEventListener('click', (e) => {
    const popup = document.getElementById('row-options-popup');
    if (!popup.contains(e.target)) {
        hideRowOptionsMenu();
    }
});

function selectAction(action) {
    currentAction = action;
    currentCoordinates1 = '';
    currentCoordinates2 = '';
    firstMarkerConfirmed = false; // Reset the marker confirmation for every action
    const actionScreenMap = {
        'Point - Score': 'mode-point-score',
        '2-Point - Score': 'mode-2-point-score',
        'Point - Miss': 'mode-point-miss',
        'Goal - Score': 'mode-goal-score',
        'Goal - Miss': 'mode-goal-miss',
        '45 Entry': 'mode-45-entry',
        'Source of Shot': 'mode-source-of-shot',
        'Free Won': 'mode-free-won',
        'Ball - Won': 'mode-ball-won',
        'Ball Won (Forced)': 'mode-ball-won',
        'Ball Won (Unforced)': 'mode-ball-won-unforced',
        'Ball - Lost': 'mode-ball-lost',
        'Ball Lost (Forced)': 'mode-ball-lost',
        'Ball Lost (Unforced)': 'mode-ball-lost-unforced',
        'Goal - Against': 'mode-goal-against',
        'Point - Against': 'mode-point-against',
        'Miss - Against': 'mode-miss-against',
        'Our Kickout': 'mode-our-kickout',
        'Opp. Kickout': 'mode-opp-kickout',
        'Kickout - Against': 'mode-kickout-against',
        '2-Point - Against': 'mode-2-point-against',
        'Foul': 'mode-foul',
        'Foul Committed': 'mode-foul',
        'Pressured Shot': 'mode-pressured-shot',
        'Card Received': 'mode-card-received',
        'Carry': 'mode-carry',
        'Point - Score (Team 2)': 'mode-point-score'
    };

    if (actionScreenMap[action]) {
        switchScreen(actionScreenMap[action]);
    } else {
        // Check for Team 2 context for direct player selection actions
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-team2');
        } else {
            switchScreen('player-buttons');
        }
    }
}

function selectMode(mode) {
    currentMode = mode;
    const actionDefinitionMap = {
        'Point - Miss': 'definition-point-miss',
        'Goal - Miss': 'definition-goal-miss',
        'Our Kickout': 'definition-our-kickout',
        'Opp. Kickout': 'definition-opp-kickout',
        'Kickout - Against': 'definition-kickout-against',
        'Ball - Won': 'definition-ball-won',
        'Ball - Lost': 'definition-ball-lost',
        'Foul': 'definition-foul',
        'Miss - Against': 'definition-miss-against'
    };

    
    if (currentAction === 'Carry') {
        // Always go to player selection first, then coordinates if enabled
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-team2');
        } else {
            switchScreen('player-buttons');
        }
    } else if (currentAction === 'Free Won') {
        // Free Won goes directly to player selection, skipping definition screen
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-team2');
        } else {
            switchScreen('player-buttons');
        }
    } else if (currentAction === 'Ball Lost (Forced)') {
        // Ball Lost (Forced) goes directly to player selection, skipping definition screen
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-team2');
        } else {
            switchScreen('player-buttons');
        }
    } else if (currentAction === 'Ball Lost (Unforced)') {
        // Ball Lost (Unforced) goes directly to player selection, skipping definition screen
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-team2');
        } else {
            switchScreen('player-buttons');
        }
    } else if (currentAction === 'Ball Won (Forced)') {
        // Ball Won (Forced) goes directly to player selection, skipping definition screen
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-team2');
        } else {
            switchScreen('player-buttons');
        }
    } else if (currentAction === 'Ball Won (Unforced)') {
        // Ball Won (Unforced) goes directly to player selection, skipping definition screen
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-team2');
        } else {
            switchScreen('player-buttons');
        }
    } else if (currentAction === 'Foul Committed') {
        // Foul Committed has conditional routing based on mode
        if (currentMode === 'Physical') {
            switchScreen('foul-physical-screen2');
        } else if (currentMode === 'Technical') {
            switchScreen('foul-technical-screen2');
        } else {
            // This handles the second mode selection (specific foul type) - go to player selection
            if (window.matchLogContext && currentMatchLogTeam === 2) {
                switchScreen('player-buttons-team2');
            } else {
                switchScreen('player-buttons');
            }
        }
    } else if (currentAction === 'Pressured Shot') {
        // Pressured Shot goes directly to player selection, skipping definition screen
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-team2');
        } else {
            switchScreen('player-buttons');
        }
    } else if (currentAction === 'Card Received') {
        // Card Received has conditional routing based on mode
        if (mode === 'Yellow Card' || mode === 'Black Card' || mode === 'Red Card (Direct)' || mode === 'Red Card (Y+Y/Y+B)') {
            // First mode selection (card type) - go to Screen 2
            switchScreen('card-received-screen2');
        } else {
            // Second mode selection (reason) - go to player selection
            if (window.matchLogContext && currentMatchLogTeam === 2) {
                switchScreen('player-buttons-team2');
            } else {
                switchScreen('player-buttons');
            }
        }
    } else if (currentAction === '45 Entry') {
        // 45 Entry has conditional routing based on mode
        if (mode === 'Carry (Fast)' || mode === 'Carry (Slow)' || mode === 'Other') {
            // Single player selection, then log action
            if (window.matchLogContext && currentMatchLogTeam === 2) {
                switchScreen('player-buttons-team2');
            } else {
                switchScreen('player-buttons');
            }
        } else {
            // Kickpass or Handpass - go to first player selection
            if (window.matchLogContext && currentMatchLogTeam === 2) {
                switchScreen('player-buttons-team2');
            } else {
                switchScreen('player-buttons');
            }
        }
    } else if (currentAction === 'Source of Shot') {
        // Source of Shot logs action directly after mode selection
        logAction();
    } else if (currentAction === 'Opp. Kickout') {
        // Opp. Kickout always goes to definition screen first
        switchScreen('definition-opp-kickout');
    } else if (actionDefinitionMap[currentAction]) {
        switchScreen(actionDefinitionMap[currentAction]);
    } else if (currentAction.includes('(Team 2)') || (window.matchLogContext && currentMatchLogTeam === 2)) {
        // Team 2 actions go to Team 2 player selection
        switchScreen('player-buttons-team2');
    } else {
        switchScreen('player-buttons');
    }
}

function selectDefinition(definition) {
    currentDefinition = definition;

    if (currentAction === 'Our Kickout') {
        // Our Kickout has conditional routing based on mode
        if (currentMode === 'Won Clean' || currentMode === 'Won Break' || currentMode === 'Won Sideline' || currentMode === 'Won Foul') {
            // Go to Team 1 player selection
            switchScreen('player-buttons');
        } else if (currentMode === 'Lost Clean' || currentMode === 'Lost Break' || currentMode === 'Lost Sideline' || currentMode === 'Lost Foul') {
            // Go to Team 2 player selection
            switchScreen('player-buttons-team2');
        }
    } else if (currentAction === 'Opp. Kickout') {
        // Opp. Kickout has conditional routing based on mode
        if (currentMode === 'Won Clean' || currentMode === 'Won Break' || currentMode === 'Won Sideline' || currentMode === 'Won Foul') {
            // Team 2 won the kickout - go to Team 2 player selection
            switchScreen('player-buttons-team2');
        } else if (currentMode === 'Lost Clean' || currentMode === 'Lost Break' || currentMode === 'Lost Sideline' || currentMode === 'Lost Foul') {
            // Team 2 lost the kickout (Team 1 won) - go to Team 1 player selection
            switchScreen('player-buttons');
        }
    } else if ((gridEnabled && GRID_ACTIONS.has(currentAction)) || (coordinatesEnabled && (currentAction === '2-Point - Score' || currentAction === 'Ball - Won' || currentAction === 'Ball - Lost' || currentAction === 'Kickout - Against' || currentAction === '2-Point - Against' || currentAction === 'Miss - Against'))) {
        gridSelectionActive = !!(gridEnabled && GRID_ACTIONS.has(currentAction));
        updateCoordinateScreenMode();
        switchScreen('coordinate-screen'); // Go to coordinate screen for specified actions after definition screen
    } else {
        // Check for Team 2 context
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-team2');
        } else {
            switchScreen('player-buttons');
        }
    }
}

function selectPlayer(player) {
    currentPlayer = player;
    if (currentAction === 'Handpass' || currentAction === 'Kickpass') {
        // Check for Team 2 context for second player selection
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            switchScreen('player-buttons-second-team2');
        } else {
            switchScreen('player-buttons-second');
        }
    } else if (currentAction === '45 Entry') {
        // 45 Entry has conditional routing based on mode
        if (currentMode === 'Carry (Fast)' || currentMode === 'Carry (Slow)' || currentMode === 'Other') {
            // Single player selection, then log action
            logAction();
        } else {
            // Kickpass or Handpass - go to second player selection
            // Check for Team 2 context for second player selection
            if (window.matchLogContext && currentMatchLogTeam === 2) {
                switchScreen('player-buttons-second-team2');
            } else {
                switchScreen('player-buttons-second');
            }
        }
    } else if ((gridEnabled && GRID_ACTIONS.has(currentAction)) || (coordinatesEnabled && (currentAction === 'Point - Score' || currentAction === '2-Point - Score' || currentAction === 'Goal - Score' || currentAction === 'Point - Score (Team 2)' || currentAction === '2-Point - Score (Team 2)' || currentAction === 'Goal - Score (Team 2)' || currentAction === 'Point - Miss' || currentAction === 'Goal - Miss' || currentAction === 'Our Kickout' || currentAction === 'Opp. Kickout' || currentAction === 'Point - Against' || currentAction === 'Goal - Against' || currentAction === 'Miss - Against' || currentAction === 'Carry' || currentAction === 'Free Won' || currentAction === 'Ball Lost (Forced)' || currentAction === 'Ball Lost (Unforced)' || currentAction === 'Ball Won (Forced)' || currentAction === 'Ball Won (Unforced)' || currentAction === 'Foul Committed'))) {
        gridSelectionActive = !!(gridEnabled && GRID_ACTIONS.has(currentAction));
        updateCoordinateScreenMode();
        switchScreen('coordinate-screen'); // Go to coordinate screen after player selection
    } else {
        logAction();
    }
}

function selectSecondPlayer(player) {
    secondPlayer = player;
    if (currentAction === '45 Entry') {
        // 45 Entry doesn't use coordinates, log action directly
        logAction();
    } else if ((gridEnabled && GRID_ACTIONS.has(currentAction)) || (coordinatesEnabled && (currentAction === 'Handpass' || currentAction === 'Kickpass'))) {
        gridSelectionActive = !!(gridEnabled && GRID_ACTIONS.has(currentAction));
        updateCoordinateScreenMode();
        switchScreen('coordinate-screen'); // Go to coordinate screen after second player selection
    } else {
        logAction();
    }
}

function logAction() {
    try {
        const entry = {
            action: currentAction,
            mode: currentMode,
            definition: currentDefinition,
            player: currentPlayer > 100 ? (oppositionPlayerNames[currentPlayer] || currentPlayer) : (playerNames[currentPlayer] || currentPlayer),
            player2: secondPlayer > 100 ? (oppositionPlayerNames[secondPlayer] || secondPlayer || '') : (playerNames[secondPlayer] || secondPlayer || ''),
            coordinates1: currentCoordinates1 || '',
            coordinates2: currentCoordinates2 || '',
            notes: []
        };
        
        // Store the actual team name and team number at the time of logging
        const teamCode = getTeamFromAction(entry);
        const getCurrentTeamDisplayName = (team) => {
            if (team === 'team1') {
                const team1Button = document.getElementById('rename-team-1-button');
                return team1Button ? team1Button.textContent.trim() : 'Team 1';
            } else {
                const team2Button = document.getElementById('rename-team-2-button');
                return team2Button ? team2Button.textContent.trim() : 'Team 2';
            }
        };
        entry.team = getCurrentTeamDisplayName(teamCode);
        entry.teamNumber = teamCode === 'team1' ? 1 : 2;

        actionsLog.push(entry);
        updateSummary();

        if (currentAction === 'Point - Score') {
            if (window.matchLogContext && currentMatchLogTeam === 2) {
                team2Points++;
            } else {
                team1Points++;
            }
        } else if (currentAction === '2-Point - Score') {
            if (window.matchLogContext && currentMatchLogTeam === 2) {
                team2Points += 2;
            } else {
                team1Points += 2;
            }
        } else if (currentAction === 'Goal - Score') {
            if (window.matchLogContext && currentMatchLogTeam === 2) {
                team2Goals++;
            } else {
                team1Goals++;
            }
        } else if (currentAction === 'Point - Score (Team 2)') {
            team2Points++;
        } else if (currentAction === '2-Point - Score (Team 2)') {
            team2Points += 2;
        } else if (currentAction === 'Goal - Score (Team 2)') {
            team2Goals++;
        } else if (currentAction === 'Point - Against') {
            team2Points++;
        } else if (currentAction === '2-Point - Against') {
            team2Points += 2;
        } else if (currentAction === 'Goal - Against') {
            team2Goals++;
        }

        updateCounters();
        resetSelection();
        resetCoordinateScreen(); // Reset the coordinate screen after logging the action
        
        // Add success animation to the action button that was clicked
        const actionButton = document.querySelector(`[data-action="${currentAction}"]`);
        if (actionButton) {
            actionButton.classList.add('swap-success');
            setTimeout(() => {
                actionButton.classList.remove('swap-success');
            }, 600);
        }
        
        // Return to appropriate screen based on context
        if (window.matchLogContext) {
            switchScreen('match-log-action-buttons');
            window.matchLogContext = false; // Reset context
        } else {
            switchScreen('action-buttons');
        }
        
        filterActions();
    } catch (error) {
        console.error('Error in logAction:', error);
        alert('An error occurred while logging the action. Please try again.');
    }
}

function logPointAgainst() {
    const entry = {
        action: currentAction,
        mode: currentMode,
        definition: currentDefinition,
        player: currentMode === 'Mistake' ? (currentPlayer > 100 ? (oppositionPlayerNames[currentPlayer] || currentPlayer) : (playerNames[currentPlayer] || currentPlayer)) : '', // Log player if Mistake
        player2: '',
        coordinates1: currentCoordinates1 || '',
        coordinates2: currentCoordinates2 || ''
    };
    
    // Store the actual team name at the time of logging
    const teamCode = getTeamFromAction(entry);
    const getCurrentTeamDisplayName = (team) => {
        if (team === 'team1') {
            const team1Button = document.getElementById('rename-team-1-button');
            return team1Button ? team1Button.textContent.trim() : 'Team 1';
        } else {
            const team2Button = document.getElementById('rename-team-2-button');
            return team2Button ? team2Button.textContent.trim() : 'Team 2';
        }
    };
    entry.team = getCurrentTeamDisplayName(teamCode);
    entry.teamNumber = teamCode === 'team1' ? 1 : 2;
    
    actionsLog.push(entry);
    updateSummary();
    team2Points++;
    updateCounters();
    resetSelection();
    switchScreen('action-buttons'); // Return to Stats screen
}

function logGoalAgainst() {
    const entry = {
        action: currentAction,
        mode: currentMode,
        definition: currentDefinition,
        player: currentMode === 'Mistake' ? (currentPlayer > 100 ? (oppositionPlayerNames[currentPlayer] || currentPlayer) : (playerNames[currentPlayer] || currentPlayer)) : '', // Log player if Mistake
        player2: '',
        coordinates1: currentCoordinates1 || '',
        coordinates2: currentCoordinates2 || ''
    };
    
    // Store the actual team name at the time of logging
    const teamCode = getTeamFromAction(entry);
    const getCurrentTeamDisplayName = (team) => {
        if (team === 'team1') {
            const team1Button = document.getElementById('rename-team-1-button');
            return team1Button ? team1Button.textContent.trim() : 'Team 1';
        } else {
            const team2Button = document.getElementById('rename-team-2-button');
            return team2Button ? team2Button.textContent.trim() : 'Team 2';
        }
    };
    entry.team = getCurrentTeamDisplayName(teamCode);
    entry.teamNumber = teamCode === 'team1' ? 1 : 2;
    
    actionsLog.push(entry);
    updateSummary();
    team2Goals++;
    updateCounters();
    resetSelection();
    switchScreen('action-buttons'); // Return to Stats screen
}

function logMissAgainst() {
    const entry = {
        action: currentAction,
        mode: currentMode,
        definition: currentDefinition,
        player: '', // Leave player column clear
        player2: ''
    };
    
    // Store the actual team name at the time of logging
    const teamCode = getTeamFromAction(entry);
    const getCurrentTeamDisplayName = (team) => {
        if (team === 'team1') {
            const team1Button = document.getElementById('rename-team-1-button');
            return team1Button ? team1Button.textContent.trim() : 'Team 1';
        } else {
            const team2Button = document.getElementById('rename-team-2-button');
            return team2Button ? team2Button.textContent.trim() : 'Team 2';
        }
    };
    entry.team = getCurrentTeamDisplayName(teamCode);
    entry.teamNumber = teamCode === 'team1' ? 1 : 2;
    
    actionsLog.push(entry);
    updateSummary();
    updateCounters();
    resetSelection();
    switchScreen('action-buttons');
}

function returnToActionScreen() {
    resetSelection();
    // Check if we're in Match Log context
    if (window.matchLogContext) {
        switchScreen('match-log-action-buttons');
        window.matchLogContext = false; // Reset the context
    } else {
    switchScreen('action-buttons');
    }
}

function returnToFirstPlayerScreen() {
    switchScreen('player-buttons');
}

function returnToModeScreen() {
    const actionModeMap = {
        'Point - Score': 'mode-point-score',
        '2-Point - Score': 'mode-2-point-score',
        'Goal - Score': 'mode-goal-score',
        'Point - Miss': 'mode-point-miss',
        'Goal - Miss': 'mode-goal-miss',
        '45 Entry': 'mode-45-entry',
        'Source of Shot': 'mode-source-of-shot',
        'Free Won': 'mode-free-won',
        'Ball - Won': 'mode-ball-won',
        'Ball - Lost': 'mode-ball-lost',
        'Goal - Against': 'mode-goal-against',
        'Point - Against': 'mode-point-against',
        'Miss - Against': 'mode-miss-against',
        'Our Kickout': 'mode-our-kickout',
        'Opp. Kickout': 'mode-opp-kickout',
        'Kickout - Against': 'mode-kickout-against',
        '2-Point - Against': 'mode-2-point-against'
    };

    if (actionModeMap[currentAction]) {
        switchScreen(actionModeMap[currentAction]);
    } else {
        switchScreen('action-buttons');
    }
}

function switchScreen(screenId) {
    // Preserve requested id for logging
    let desiredScreenId = screenId;

    // If in Match Log context and routing to generic action screen, redirect
    if (window.matchLogContext && desiredScreenId === 'action-buttons') {
        desiredScreenId = 'match-log-action-buttons';
        window.matchLogContext = false; // Reset the context
    }

    // Resolve target screen or a safe fallback BEFORE altering current screens
    let targetScreen = document.getElementById(desiredScreenId);

    if (!targetScreen) {
        // Try context-aware fallback to prevent blank UI
        const matchLogFallback = document.getElementById('match-log-action-buttons');
        const actionButtonsFallback = document.getElementById('action-buttons');

        if (window.matchLogContext && matchLogFallback) {
            targetScreen = matchLogFallback;
            desiredScreenId = 'match-log-action-buttons';
            window.matchLogContext = false;
        } else if (matchLogFallback && (desiredScreenId || '').includes('match-log')) {
            targetScreen = matchLogFallback;
            desiredScreenId = 'match-log-action-buttons';
        } else if (actionButtonsFallback) {
            targetScreen = actionButtonsFallback;
            desiredScreenId = 'action-buttons';
        }
    }

    if (!targetScreen) {
        // If still not resolved, keep current screen as-is to avoid a blank view
        console.error(`Screen with ID ${screenId} not found. Keeping current screen.`);
        return;
    }

    // Now we have a valid target; perform the switch
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    targetScreen.classList.add('active');

    if (desiredScreenId === 'coordinate-screen') {
        drawPitch(); // Ensure the pitch is drawn when entering the coordinate screen
    }
}

function updateSummary() {
    const summaryTable = document.getElementById('summary-table');
    const summaryTableHead = summaryTable.querySelector('thead');
    const summaryTableBody = summaryTable.querySelector('tbody');

    // Clear existing table content
    summaryTableHead.innerHTML = '';
    summaryTableBody.innerHTML = '';

    // Extract unique values for each filter column (cascading)
    const uniqueValues = (key) => {
        return [...new Set(
            actionsLog
                .filter(entry => {
                    if (key !== 'player' && filters.player && entry.player !== filters.player) return false;
                    if (key !== 'action' && filters.action && entry.action !== filters.action) return false;
                    if (key !== 'definition' && filters.definition && entry.definition !== filters.definition) return false;
                    if (key !== 'mode' && filters.mode && entry.mode !== filters.mode) return false;
                    if (key !== 'team' && filters.team && entry.team !== filters.team) return false;
                    return true;
                })
                .map(entry => entry[key])
                .filter(Boolean)
        )].sort();
    };

    // First row: column labels
    const headerLabelRow = document.createElement('tr');

    ['Action', 'Add_1', 'Add_2', 'Team', 'Player_1', 'Player_2', 'X1', 'Y1', 'X2', 'Y2', 'Notes'].forEach(label => {
        const th = document.createElement('th');
        th.textContent = label;
        headerLabelRow.appendChild(th);
    });

    summaryTableHead.appendChild(headerLabelRow);

    // Second row: filter dropdowns
    const filterRow = document.createElement('tr');

    filterRow.appendChild(createFilterHeader('', 'action', uniqueValues('action')));
    filterRow.appendChild(createFilterHeader('', 'mode', uniqueValues('mode')));
    filterRow.appendChild(createFilterHeader('', 'definition', uniqueValues('definition')));
    filterRow.appendChild(createFilterHeader('', 'team', uniqueValues('team')));
    filterRow.appendChild(createFilterHeader('', 'player', uniqueValues('player')));

    for (let i = 0; i < 6; i++) {
        filterRow.appendChild(document.createElement('th'));
    }

    summaryTableHead.appendChild(filterRow);

    // Filtered dataset
    const filteredData = actionsLog
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => {
            if (filters.player && entry.player !== filters.player) return false;
            if (filters.action && entry.action !== filters.action) return false;
            if (filters.definition && entry.definition !== filters.definition) return false;
            if (filters.mode && entry.mode !== filters.mode) return false;
            if (filters.team && entry.team !== filters.team) return false;
            return true;
        });

    // Render filtered rows (newest first)
    const sortedFilteredData = [...filteredData].reverse();
    sortedFilteredData.forEach(({ entry, index }) => {
        const row = document.createElement('tr');

        const actionCell = document.createElement('td');
        const add1Cell = document.createElement('td');
        const add2Cell = document.createElement('td');
        const teamCell = document.createElement('td');
        const player1Cell = document.createElement('td');
        const player2Cell = document.createElement('td');
        const x1Cell = document.createElement('td');
        const y1Cell = document.createElement('td');
        const x2Cell = document.createElement('td');
        const y2Cell = document.createElement('td');

        actionCell.textContent = entry.action;
        add1Cell.textContent = entry.mode;
        add2Cell.textContent = entry.definition;
        // Use the stored team name directly (no conversion needed)
        teamCell.textContent = entry.team;
        player1Cell.textContent = entry.player;
        player2Cell.textContent = entry.player2;

        if (entry.coordinates1) {
            if (typeof entry.coordinates1 === 'string' && entry.coordinates1.startsWith('GRID')) {
                x1Cell.textContent = entry.coordinates1;
                y1Cell.textContent = entry.coordinates1;
            } else {
                const [x1, y1] = entry.coordinates1.slice(1, -1).split(', ');
                x1Cell.textContent = x1;
                y1Cell.textContent = y1;
            }
        }

        if (entry.coordinates2) {
            if (typeof entry.coordinates2 === 'string' && entry.coordinates2.startsWith('GRID')) {
                // For GRID mode, X2/Y2 remain blank to reflect single-area selection
            } else {
                const [x2, y2] = entry.coordinates2.slice(1, -1).split(', ');
                x2Cell.textContent = x2;
                y2Cell.textContent = y2;
            }
        }

        row.appendChild(actionCell);
        row.appendChild(add1Cell);
        row.appendChild(add2Cell);
        row.appendChild(teamCell);
        row.appendChild(player1Cell);
        row.appendChild(player2Cell);
        row.appendChild(x1Cell);
        row.appendChild(y1Cell);
        row.appendChild(x2Cell);
        row.appendChild(y2Cell);

        const noteCell = document.createElement('td');
        noteCell.classList.add('note-icon-cell');

        if (entry.notes && entry.notes.length > 0) {
            const noteButton = document.createElement('button');
            noteButton.textContent = '📝';
            noteButton.title = 'View/Edit Notes';
            noteButton.classList.add('note-button');

            noteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering row click
                openViewEditNotePopup(index);
            });

            noteCell.appendChild(noteButton);
        }

        row.appendChild(noteCell);

        // Make row clickable
        row.classList.add('summary-row');
        row.dataset.index = index;

        row.addEventListener('click', (e) => {
            e.stopPropagation();
            // Remove highlight from any previously selected row
            document.querySelectorAll('.summary-row.selected-row').forEach(r => {
                r.classList.remove('selected-row');
            });

            // Add highlight to the clicked row
            row.classList.add('selected-row');

            // Show context menu
            showRowOptionsMenu(e.currentTarget, index);
        });

        summaryTableBody.appendChild(row);
    });
    
    // Update timeline if it's the active view
    if (currentSummaryView === 'timeline') {
        buildTimeline();
    }
    
    // Update stats tab
    updateStatsTab();
}

function exportDataToCSV() {
    try {
        // Define CSV headers
        const headers = ['Action', 'Add_1', 'Add_2', 'Team', 'Team_Number', 'Player_1', 'Player_2', 'X1', 'Y1', 'X2', 'Y2', 'Notes'];
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        
        // Add data rows
        actionsLog.forEach(entry => {
            // Extract coordinates or GRID
            let x1 = '', y1 = '', x2 = '', y2 = '';

            if (entry.coordinates1) {
                if (typeof entry.coordinates1 === 'string' && entry.coordinates1.startsWith('GRID')) {
                    x1 = entry.coordinates1;
                    y1 = entry.coordinates1;
                } else {
                    const coords1 = entry.coordinates1.slice(1, -1).split(', ');
                    if (coords1.length >= 2) {
                        x1 = coords1[0];
                        y1 = coords1[1];
                    }
                }
            }

            if (entry.coordinates2) {
                if (typeof entry.coordinates2 === 'string' && entry.coordinates2.startsWith('GRID')) {
                    // For GRID mode, export X2/Y2 empty (single-area selection)
                } else {
                    const coords2 = entry.coordinates2.slice(1, -1).split(', ');
                    if (coords2.length >= 2) {
                        x2 = coords2[0];
                        y2 = coords2[1];
                    }
                }
            }
            
            const row = [
                entry.action || '',
                entry.mode || '',
                entry.definition || '',
                entry.team || '',
                entry.teamNumber || '',
                entry.player || '',
                entry.player2 || '',
                x1,
                y1,
                x2,
                y2,
                entry.notes && entry.notes.length > 0 ? entry.notes.join('; ') : ''
            ];
            
            // Escape CSV values (handle commas, quotes, newlines)
            const escapedRow = row.map(value => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return '"' + stringValue.replace(/"/g, '""') + '"';
                }
                return stringValue;
            });
            
            csvContent += escapedRow.join(',') + '\n';
        });
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            // Generate filename with team names and date
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const dateString = `${day}/${month}/${year}`;
            
            // Get current team names
            const team1Button = document.getElementById('rename-team-1-button');
            const team2Button = document.getElementById('rename-team-2-button');
            const team1Name = team1Button ? team1Button.textContent.trim() : 'Team 1';
            const team2Name = team2Button ? team2Button.textContent.trim() : 'Team 2';
            
            const filename = `${team1Name} vs ${team2Name}; Data for ${dateString}.csv`;
            
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL object
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error exporting data to CSV:', error);
        alert('Error exporting data. Please try again.');
    }
}

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvContent = e.target.result;
            const lines = csvContent.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                alert('CSV file appears to be empty or invalid.');
                return;
            }
            
            // Parse header row
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const expectedHeaders = ['Action', 'Add_1', 'Add_2', 'Team', 'Team_Number', 'Player_1', 'Player_2', 'X1', 'Y1', 'X2', 'Y2', 'Notes'];
            
            // Check if headers match expected format (with or without Team_Number for backward compatibility)
            const hasTeamNumber = headers.some(header => header === 'Team_Number');
            const requiredHeaders = hasTeamNumber ? expectedHeaders : expectedHeaders.filter(h => h !== 'Team_Number');
            const headersMatch = requiredHeaders.every(expected => 
                headers.some(header => header === expected)
            );
            
            if (!headersMatch) {
                alert('CSV file format does not match expected columns. Please ensure the file has the correct headers.');
                return;
            }
            
            // Parse data rows
            const newEntries = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                // Parse CSV line (handle quoted values)
                const values = parseCSVLine(line);
                
                // Handle both old format (11 columns) and new format (12 columns with Team_Number)
                const minColumns = hasTeamNumber ? 12 : 11;
                if (values.length >= minColumns) {
                    // Get current team names for display
                    const team1Button = document.getElementById('rename-team-1-button');
                    const team2Button = document.getElementById('rename-team-2-button');
                    const currentTeam1Name = team1Button ? team1Button.textContent.trim() : 'Team 1';
                    const currentTeam2Name = team2Button ? team2Button.textContent.trim() : 'Team 2';
                    
                    let teamNumber, displayTeamName, player, player2, x1, y1, x2, y2, notes;
                    
                    if (hasTeamNumber) {
                        // New format with Team_Number column
                        teamNumber = parseInt(values[4]) || 1;
                        displayTeamName = teamNumber === 1 ? currentTeam1Name : currentTeam2Name;
                        player = values[5] || '';
                        player2 = values[6] || '';
                        x1 = values[7];
                        y1 = values[8];
                        x2 = values[9];
                        y2 = values[10];
                        notes = values[11];
                    } else {
                        // Old format without Team_Number column - use team name matching
                        const originalTeamName = values[3] || '';
                        // Try to match with current team names, default to Team 1 if no match
                        if (originalTeamName === currentTeam1Name) {
                            teamNumber = 1;
                            displayTeamName = currentTeam1Name;
                        } else if (originalTeamName === currentTeam2Name) {
                            teamNumber = 2;
                            displayTeamName = currentTeam2Name;
                        } else {
                            // No match found, default to Team 1
                            teamNumber = 1;
                            displayTeamName = currentTeam1Name;
                        }
                        player = values[4] || '';
                        player2 = values[5] || '';
                        x1 = values[6];
                        y1 = values[7];
                        x2 = values[8];
                        y2 = values[9];
                        notes = values[10];
                    }
                    
                    const entry = {
                        action: values[0] || '',
                        mode: values[1] || '',
                        definition: values[2] || '',
                        team: displayTeamName, // Use current team name for display
                        teamNumber: teamNumber, // Use team number for logic
                        player: player,
                        player2: player2,
                        coordinates1: x1 && y1 ? `(${x1}, ${y1})` : '',
                        coordinates2: x2 && y2 ? `(${x2}, ${y2})` : '',
                        notes: notes ? notes.split('; ').filter(note => note.trim()) : []
                    };
                    
                    newEntries.push(entry);
                }
            }
            
            if (newEntries.length === 0) {
                alert('No valid data found in CSV file.');
                return;
            }
            
            // Add new entries to existing data (stack, don't replace)
            actionsLog.push(...newEntries);
            
            // Update score counters based on uploaded data
            updateScoreCountersFromData();
            
            // Update the summary table
            updateSummary();
            
            // Update counters and stats
            updateCounters();
            updateStatsTab();
            
            alert(`Successfully uploaded ${newEntries.length} data entries.`);
            
        } catch (error) {
            console.error('Error parsing CSV file:', error);
            alert('Error parsing CSV file. Please check the file format and try again.');
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
}

function createFilterHeader(label, key, options) {
    const th = document.createElement('th');
    const select = document.createElement('select');
    select.innerHTML = `<option>-- All --</option>`;
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (filters[key] === opt) option.selected = true;
        select.appendChild(option);
    });
    select.onchange = () => setFilter(key, select.value);
    th.appendChild(select);
    return th;
}


function deleteEntry(index) {
    const entry = actionsLog[index];

    // Adjust score based on deleted action
    const teamCode = getTeamFromAction(entry);
    switch (entry.action) {
        case 'Point - Score':
            if (teamCode === 'team2') {
                team2Points -= 1;
            } else {
                team1Points -= 1;
            }
            break;
        case '2-Point - Score':
            if (teamCode === 'team2') {
                team2Points -= 2;
            } else {
                team1Points -= 2;
            }
            break;
        case 'Goal - Score':
            if (teamCode === 'team2') {
                team2Goals -= 1;
            } else {
                team1Goals -= 1;
            }
            break;
        case 'Point - Against':
            team2Points -= 1;
            break;
        case '2-Point - Against':
            team2Points -= 2;
            break;
        case 'Goal - Against':
            team2Goals -= 1;
            break;
    }

    // Ensure scores don't go negative (prevent user error or inconsistent state)
    team1Goals = Math.max(0, team1Goals);
    team1Points = Math.max(0, team1Points);
    team2Goals = Math.max(0, team2Goals);
    team2Points = Math.max(0, team2Points);

    // Remove entry and refresh
    actionsLog.splice(index, 1);
    updateSummary();
    updateCounters();
    filterActions();
}

// Undo functionality variables
let deletedEntry = null;
let deletedIndex = -1;
let undoTimeout = null;

function deleteEntryWithUndo(index) {
    // Store the deleted entry and its original index for potential undo
    deletedEntry = JSON.parse(JSON.stringify(actionsLog[index])); // Deep copy
    deletedIndex = index;
    
    // Delete the entry
    deleteEntry(index);
    
    // Show undo button
    showUndoButton();
}

function showUndoButton() {
    // Remove any existing undo button
    hideUndoButton();
    
    // Create undo button
    const undoButton = document.createElement('div');
    undoButton.id = 'undo-button';
    undoButton.className = 'undo-button';
    undoButton.innerHTML = `
        <div class="undo-content">
            <span class="undo-icon">↶</span>
            <span class="undo-text">Undo Delete</span>
        </div>
    `;
    
    // Add click handler
    undoButton.addEventListener('click', undoDelete);
    
    // Add to page
    document.body.appendChild(undoButton);
    
    // Auto-hide after 5 seconds
    undoTimeout = setTimeout(() => {
        hideUndoButton();
    }, 5000);
}

function hideUndoButton() {
    const undoButton = document.getElementById('undo-button');
    if (undoButton) {
        undoButton.remove();
    }
    if (undoTimeout) {
        clearTimeout(undoTimeout);
        undoTimeout = null;
    }
}

function undoDelete() {
    if (deletedEntry && deletedIndex >= 0) {
        // Restore the entry at its original position
        actionsLog.splice(deletedIndex, 0, deletedEntry);
        
        // Restore score counters
        const teamCode = getTeamFromAction(deletedEntry);
        switch (deletedEntry.action) {
            case 'Point - Score':
                if (teamCode === 'team2') {
                    team2Points += 1;
                } else {
                    team1Points += 1;
                }
                break;
            case '2-Point - Score':
                if (teamCode === 'team2') {
                    team2Points += 2;
                } else {
                    team1Points += 2;
                }
                break;
            case 'Goal - Score':
                if (teamCode === 'team2') {
                    team2Goals += 1;
                } else {
                    team1Goals += 1;
                }
                break;
            case 'Point - Against':
                team2Points += 1;
                break;
            case '2-Point - Against':
                team2Points += 2;
                break;
            case 'Goal - Against':
                team2Goals += 1;
                break;
        }
        
        // Update displays
        updateSummary();
        updateCounters();
        filterActions();
        
        // Hide undo button
        hideUndoButton();
        
        // Clear undo data
        deletedEntry = null;
        deletedIndex = -1;
    }
}

// Code to allow editing in summary screen:
let currentRowIndex = null;

function showRowOptionsMenu(rowElement, index) {
    currentRowIndex = index;
    const popup = document.getElementById('row-options-popup');
	if (!popup) return;
	// Position popup just to the right of the clicked element
	positionRowOptionsPopup(popup, rowElement);
	PopupAnimator.showPopup(popup, 'menu');
}

function hideRowOptionsMenu() {
    const popup = document.getElementById('row-options-popup');
    PopupAnimator.hidePopup(popup, 'menu', () => {
        currentRowIndex = null;
    });
}

// Handle action when a button is clicked in the popup
function handleRowOption(action) {
    if (action === 'delete') {
        deleteEntryWithUndo(currentRowIndex);
        hideRowOptionsMenu();
    } else if (action === 'addNote') {
        noteRowIndex = currentRowIndex;
        viewEditNoteIndex = null;
        editingMode = false;
        openEnhancedNotePopup();
    }
}


function openActionNotePopup() {
    hideRowOptionsMenu();
    const action = actionsLog[currentRowIndex];
    const actionType = action.action;
    const presets = actionNotePresets[actionType] || [];
    
    const popup = document.getElementById('action-note-popup');
    if (!popup) {
        createActionNotePopup();
    }
    
    // Update popup content for this specific action
    updateActionNotePopup(actionType, presets, action);
    document.getElementById('action-note-popup').style.display = 'block';
}

function createActionNotePopup() {
    const popup = document.createElement('div');
    popup.id = 'action-note-popup';
    popup.className = 'popup';
    popup.style.display = 'none';
    
    popup.innerHTML = `
        <div class="popup-content sleek-popup action-note-content">
            <div class="action-note-header">
                <div class="note-icon">📝</div>
                <h3 class="note-title">Add Note</h3>
                <button class="close-btn" onclick="closeActionNotePopup()">×</button>
            </div>
            <div class="action-note-body">
                <div class="action-info">
                    <span class="action-type-label">Action:</span>
                    <span class="action-type-text" id="note-action-type"></span>
                </div>
                <div class="preset-notes-section">
                    <h4 class="preset-title">Quick Notes</h4>
                    <div class="preset-buttons" id="preset-buttons-container">
                        <!-- Preset buttons will be added here -->
                    </div>
                </div>
                <div class="custom-note-section">
                    <h4 class="custom-title">Custom Note</h4>
                    <div class="custom-note-input-container">
                        <textarea id="custom-note-input" placeholder="Enter your custom note..."></textarea>
                        <button class="custom-note-confirm" onclick="addCustomNote()">Add Note</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function updateActionNotePopup(actionType, presets, action) {
    document.getElementById('note-action-type').textContent = actionType;
    
    const presetsContainer = document.getElementById('preset-buttons-container');
    presetsContainer.innerHTML = '';
    
    presets.forEach(preset => {
        const button = document.createElement('button');
        button.className = 'preset-note-button';
        button.textContent = preset;
        button.onclick = () => addPresetNote(preset);
        presetsContainer.appendChild(button);
    });
    
    // Clear custom note input
    document.getElementById('custom-note-input').value = '';
}

function addPresetNote(noteText) {
    if (actionsLog[currentRowIndex]) {
        if (!actionsLog[currentRowIndex].notes) {
            actionsLog[currentRowIndex].notes = [];
        }
        actionsLog[currentRowIndex].notes.push(noteText);
        updateSummary();
        closeActionNotePopup();
    }
}

function addCustomNote() {
    const customText = document.getElementById('custom-note-input').value.trim();
    if (customText && actionsLog[currentRowIndex]) {
        if (!actionsLog[currentRowIndex].notes) {
            actionsLog[currentRowIndex].notes = [];
        }
        actionsLog[currentRowIndex].notes.push(customText);
        updateSummary();
        closeActionNotePopup();
    }
}

function closeActionNotePopup() {
    document.getElementById('action-note-popup').style.display = 'none';
}

function openEnhancedNotePopup() {
    hideRowOptionsMenu();
    const index = viewEditNoteIndex !== null ? viewEditNoteIndex : noteRowIndex;
    const entry = actionsLog[index];
    const actionType = entry.action;
    const presets = actionNotePresets[actionType] || [];
    
    // Create a simple, clean note popup
    createSimpleNotePopup(actionType, presets, index);
}

function createSimpleNotePopup(actionType, presets, index) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('simple-note-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    const popup = document.createElement('div');
    popup.id = 'simple-note-popup';
    popup.className = 'popup';
    popup.style.display = 'none';
    
    popup.innerHTML = `
        <div class="popup-content sleek-popup simple-note-content">
            <div class="simple-note-header">
                <h3>Action: ${actionType}</h3>
            </div>
            
            <div class="quick-notes-section">
                <h4>Quick Notes</h4>
                <div class="quick-notes-grid" id="quick-notes-container">
                    ${presets.map(preset => `
                        <button class="quick-note-btn" onclick="addQuickNoteAndClose('${preset}', ${index})">${preset}</button>
                    `).join('')}
                </div>
            </div>
            
            <div class="custom-note-section">
                <div class="custom-note-row">
                    <input type="text" id="simple-custom-input" placeholder="Custom Note" />
                    <button class="confirm-custom-btn" onclick="addCustomNoteAndClose(${index})">✓</button>
                </div>
            </div>
            
            <div class="note-popup-actions">
                <button class="cancel-note-btn" onclick="closeSimpleNotePopup()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    PopupAnimator.showPopup(popup, 'standard');
}

function addQuickNoteAndClose(noteText, index) {
    if (actionsLog[index]) {
        if (!actionsLog[index].notes) {
            actionsLog[index].notes = [];
        }
        actionsLog[index].notes.push(noteText);
        updateSummary();
        closeSimpleNotePopup();
    }
}

function addCustomNoteAndClose(index) {
    const customText = document.getElementById('simple-custom-input').value.trim();
    if (customText && actionsLog[index]) {
        if (!actionsLog[index].notes) {
            actionsLog[index].notes = [];
        }
        actionsLog[index].notes.push(customText);
        updateSummary();
        closeSimpleNotePopup();
    }
}

function closeSimpleNotePopup() {
    const popup = document.getElementById('simple-note-popup');
    if (popup) {
        PopupAnimator.hidePopup(popup, 'standard', () => {
            popup.remove();
        });
    }
}

function addQuickNote(text) {
    document.getElementById('custom-note-input').value = text;
}

// Universal Popup Animation System
class PopupAnimator {
    static showPopup(element, type = 'standard') {
        if (!element) return;
        
        // Position popup (only if not already positioned)
		if (type !== 'menu') {
			if (!element.style.position || element.style.position !== 'fixed') {
				element.style.position = 'fixed';
				element.style.top = '50%';
				element.style.left = '50%';
				element.style.transform = 'translate(-50%, -50%)';
				element.style.zIndex = '10000';
			}
		} else {
			// For context/row menus, do not override CSS positioning (avoid jump)
			element.style.zIndex = element.style.zIndex || '10000';
		}
        
        // Show the popup
        element.style.display = 'block';
        element.style.opacity = '1';

		// Restart CSS animation (e.g., popupSlideIn) on each open for inner content
		const animTarget = element.querySelector('.sleek-popup') || element.querySelector('.popup-content') || element;
		const prevAnimation = animTarget.style.animation;
		animTarget.style.animation = 'none';
        // Force reflow to reset animation
        // eslint-disable-next-line no-unused-expressions
		animTarget.offsetHeight;
		// Ensure an animation value exists; fallback to centered scale-in
		animTarget.style.animation = prevAnimation || 'popupScaleIn 0.24s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    static hidePopup(element, type = 'standard', callback = null) {
        if (!element || element.style.display === 'none') {
            if (callback) callback();
            return;
        }
        
        // Simply hide the popup
        element.style.display = 'none';
        if (callback) callback();
    }
}

// Enhanced Collapsible System
class CollapsibleManager {
    static toggle(element, isExpanded = null) {
        if (!element) return;
        
        // Prevent double-clicking issues
        if (element.dataset.animating === 'true') return;
        element.dataset.animating = 'true';
        
        const currentlyExpanded = !element.classList.contains('collapsed');
        const shouldExpand = isExpanded !== null ? isExpanded : !currentlyExpanded;
        
        if (shouldExpand) {
            // Expand
            element.classList.remove('collapsed');
            element.classList.add('expanded');
            
            // Calculate and set max-height
            const scrollHeight = element.scrollHeight;
            element.style.maxHeight = scrollHeight + 'px';
            
            setTimeout(() => {
                element.style.maxHeight = 'none';
                element.dataset.animating = 'false';
            }, 400);
        } else {
            // Collapse
            const scrollHeight = element.scrollHeight;
            element.style.maxHeight = scrollHeight + 'px';
            
            // Force reflow
            element.offsetHeight;
            
            element.classList.add('collapsed');
            element.classList.remove('expanded');
            element.style.maxHeight = '0px';
            
            setTimeout(() => {
                element.dataset.animating = 'false';
            }, 400);
        }
        
        return shouldExpand;
    }
}

function confirmNote() {
    const noteText = document.getElementById('custom-note-input').value.trim();
    if (!noteText) return;

    const index = noteRowIndex;
    const notes = actionsLog[index].notes || [];
    notes.push(noteText);
    actionsLog[index].notes = notes;

    updateSummary();
    closeNotePopup();
}

function closeNotePopup() {
    noteRowIndex = null;
    viewEditNoteIndex = null;
    editingMode = false;
    PopupAnimator.hidePopup(document.getElementById('note-popup'), 'standard');
}

function updateCounters() {
    document.getElementById('counter-team-1').textContent = `${team1Goals}-${team1Points.toString().padStart(2, '0')}`;
    document.getElementById('counter-team-2').textContent = `${team2Goals}-${team2Points.toString().padStart(2, '0')}`;
}

// Update score counters by recalculating from all data
function updateScoreCountersFromData() {
    // Reset counters
    team1Goals = 0;
    team1Points = 0;
    team2Goals = 0;
    team2Points = 0;
    
    // Recalculate from all actions in the log
    actionsLog.forEach(entry => {
        const teamCode = getTeamFromAction(entry);
        
        switch (entry.action) {
            case 'Point - Score':
                if (teamCode === 'team2') {
                    team2Points += 1;
                } else {
                    team1Points += 1;
                }
                break;
            case '2-Point - Score':
                if (teamCode === 'team2') {
                    team2Points += 2;
                } else {
                    team1Points += 2;
                }
                break;
            case 'Goal - Score':
                if (teamCode === 'team2') {
                    team2Goals += 1;
                } else {
                    team1Goals += 1;
                }
                break;
            case 'Point - Against':
                team2Points += 1;
                break;
            case '2-Point - Against':
                team2Points += 2;
                break;
            case 'Goal - Against':
                team2Goals += 1;
                break;
        }
    });
}

function resetSelection() {
    currentAction = '';
    currentMode = '';
    currentDefinition = '';
    currentPlayer = '';
    secondPlayer = '';
    currentCoordinates1 = '';
    currentCoordinates2 = '';
    marker1 = { x: null, y: null };
    marker2 = { x: null, y: null };
    firstMarkerConfirmed = false;
}

function openTab(tabName) {
    // Close widget tray if open when switching tabs
    if (widgetTrayOpen) {
        closeWidgetTray();
    }

    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Clear Match Log context when switching tabs
    window.matchLogContext = false;

    if (tabName === 'review') {
        refreshReviewTab();  // Call the refresh function when the review tab is shown
    } else if (tabName === 'summary') {
        // Restore the previous summary view state
        switchSummaryView(currentSummaryView);
    } else if (tabName === 'stats-tab') {
        // Update stats when the stats tab is opened
        updateStatsTab();
        // Ensure TEAMS subtab is active by default
        switchStatsSubtab('teams');
    }
}

// Stats Subtab Management
let currentStatsSubtab = 'teams';
let widgetTrayOpen = false;
let widgetTrayOutsideHandler = null;

function switchStatsSubtab(subtabName) {
    // Close widget tray if open
    if (widgetTrayOpen) {
        closeWidgetTray();
    }

    // Update active button
    document.querySelectorAll('.stats-subtab-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-subtab') === subtabName;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Update active content
    document.querySelectorAll('.stats-subtab-content').forEach(content => {
        const isActive = content.id === `stats-subtab-${subtabName}`;
        content.classList.toggle('active', isActive);
        content.setAttribute('aria-hidden', !isActive);
    });

    currentStatsSubtab = subtabName;

    // Update stats if switching to TEAMS
    if (subtabName === 'teams') {
        updateStatsTab();
    }
}

// Widget Tray Management
function openWidgetTray(context) {
    const tray = document.getElementById('widget-tray');
    if (!tray) return;

    // Only allow opening from MATCH or PLAYERS subtabs
    if (currentStatsSubtab !== 'match' && currentStatsSubtab !== 'players') {
        return;
    }

    widgetTrayOpen = true;
    tray.setAttribute('aria-hidden', 'false');
    
    // Prevent body scroll when tray is open
    document.body.style.overflow = 'hidden';

    // Add outside click handler (with delay to prevent immediate closure)
    setTimeout(() => {
        widgetTrayOutsideHandler = (e) => {
            // Don't close if clicking inside the tray or the add widget button
            if (!tray.contains(e.target) && !e.target.closest('.stats-add-widget-btn')) {
                closeWidgetTray();
            }
        };
        // Use capture phase to ensure we catch the event before it bubbles
        // Delay slightly to prevent the opening click from immediately closing
        setTimeout(() => {
            document.addEventListener('click', widgetTrayOutsideHandler, { capture: true });
        }, 100);
    }, 0);

    // ESC key handler
    const escHandler = (e) => {
        if (e.key === 'Escape' && widgetTrayOpen) {
            closeWidgetTray();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler, { once: true });
}

function closeWidgetTray() {
    const tray = document.getElementById('widget-tray');
    if (!tray) return;

    widgetTrayOpen = false;
    tray.setAttribute('aria-hidden', 'true');
    
    // Remove outside click handler if it exists
    if (widgetTrayOutsideHandler) {
        document.removeEventListener('click', widgetTrayOutsideHandler, { capture: true });
        widgetTrayOutsideHandler = null;
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Initialize stats subtab navigation
function initStatsSubtabNavigation() {
    const subtabButtons = document.querySelectorAll('.stats-subtab-btn');
    
    subtabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const subtab = btn.getAttribute('data-subtab');
            switchStatsSubtab(subtab);
        });

        // Keyboard navigation (arrow keys)
        btn.addEventListener('keydown', (e) => {
            const buttons = Array.from(subtabButtons);
            const currentIndex = buttons.indexOf(btn);
            
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                e.preventDefault();
                buttons[currentIndex - 1].focus();
                switchStatsSubtab(buttons[currentIndex - 1].getAttribute('data-subtab'));
            } else if (e.key === 'ArrowRight' && currentIndex < buttons.length - 1) {
                e.preventDefault();
                buttons[currentIndex + 1].focus();
                switchStatsSubtab(buttons[currentIndex + 1].getAttribute('data-subtab'));
            }
        });
    });

    // Ensure TEAMS is default on first load
    if (document.getElementById('stats-tab')?.classList.contains('active')) {
        switchStatsSubtab('teams');
    }
}

function showRenameInput(team) {
    if (team === '1') {
        document.getElementById('rename-team-1-input').style.display = 'inline';
        document.getElementById('confirm-rename-button-1').style.display = 'inline';
    } else if (team === '2') {
        document.getElementById('rename-team-2-input').style.display = 'inline';
        document.getElementById('confirm-rename-button-2').style.display = 'inline';
    }
}

function renameTeam(team) {
    if (team === '1') {
        const newName = document.getElementById('rename-team-1-input').value;
        if (newName.trim() !== '') {
            // Update the team button text
            const team1Button = document.getElementById('rename-team-1-button');
            if (team1Button) {
                team1Button.textContent = newName.trim();
            }
            // Update banner team name
            document.querySelectorAll('.counter-container .team-name')[0].textContent = `${newName}:`;
            document.getElementById('rename-team-1-input').style.display = 'none';
            document.getElementById('confirm-rename-button-1').style.display = 'none';
            document.getElementById('rename-team-1-input').value = ''; // Clear the input box
            // Update Match Log team names
            updateMatchLogTeamNames();
        } else {
            alert('Please enter a valid team name.');
        }
    } else if (team === '2') {
        const newName = document.getElementById('rename-team-2-input').value;
        if (newName.trim() !== '') {
            // Update the team button text
            const team2Button = document.getElementById('rename-team-2-button');
            if (team2Button) {
                team2Button.textContent = newName.trim();
            }
            // Update banner team name
            document.querySelectorAll('.counter-container .team-name')[1].textContent = `${newName}:`;
            document.getElementById('rename-team-2-input').style.display = 'none';
            document.getElementById('confirm-rename-button-2').style.display = 'none';
            document.getElementById('rename-team-2-input').value = ''; // Clear the input box
            // Update Match Log team names
            updateMatchLogTeamNames();
        } else {
            alert('Please enter a valid team name.');
        }
    }
}

function updatePlayerLabels() {
    // Update our team players (1-30)
    for (let i = 1; i <= 30; i++) {
        const homeBtn = document.getElementById(`player-${i}-button`);
        if (homeBtn) homeBtn.textContent = playerNames[i];

        // Update player selection screens
        document.querySelectorAll(`.player-button[aria-label="Select Player ${i}"]`).forEach(button => {
            button.textContent = playerNames[i];
        });
        document.querySelectorAll(`.player-button[aria-label="Select Receiver ${i}"]`).forEach(button => {
            button.textContent = playerNames[i];
        });
    }
    
    // Update opposition players (101-130)
    for (let i = 101; i <= 130; i++) {
        const oppBtn = document.getElementById(`opp-player-${i - 100}-button`);
        if (oppBtn) oppBtn.textContent = oppositionPlayerNames[i];
        
        // Update Team 2 player selection screens (both first and second)
        document.querySelectorAll(`.player-button[aria-label="Select Player ${i}"]`).forEach(button => {
            button.textContent = oppositionPlayerNames[i];
        });
    }
}

function confirmChanges() {
    // Update team names
    const team1NewName = document.getElementById('rename-team-1-button').textContent.trim();
    const team2NewName = document.getElementById('rename-team-2-button').textContent.trim();

    if (team1NewName !== '') {
        document.querySelectorAll('.counter-container .team-name')[0].textContent = `${team1NewName}:`;
    } else {
        alert('Please enter a valid name for Team 1.');
        return;
    }

    if (team2NewName !== '') {
        document.querySelectorAll('.counter-container .team-name')[1].textContent = `${team2NewName}:`;
    } else {
        alert('Please enter a valid name for Team 2.');
        return;
    }

    // Update player names
    for (let i = 1; i <= 15; i++) {
        const button = document.getElementById(`player-${i}-button`);
        const newName = button.textContent.trim();
        if (newName !== '') {
            playerNames[i] = newName;
        } else {
            alert(`Please enter a valid name for Player ${i}.`);
            return;
        }
    }
    updatePlayerLabels();
    
    // Update Match Log team names
    updateMatchLogTeamNames();
    
    alert('Changes confirmed.');
}

document.querySelectorAll('button[contenteditable="true"]').forEach(button => {
    button.addEventListener('keydown', function(e) {
        if (e.key === ' ') {
            document.execCommand('insertHTML', false, ' ');
            e.preventDefault();
        }
    });
});

const canvas = document.getElementById('pitch');
const ctx = canvas.getContext('2d');
const confirmCoordinatesButton = document.getElementById('confirmCoordinatesButton');

let marker = { x: null, y: null };

// Draw the pitch lines
const drawLine = (startX, startY, endX, endY) => {
    ctx.beginPath();
    ctx.moveTo(mapX(startX), mapY(startY));
    ctx.lineTo(mapX(endX), mapY(endY));
    ctx.stroke();
};

// Map pitch coordinates to canvas coordinates
const mapX = x => (x / 80) * canvas.width;
const mapY = y => canvas.height - (y / 140) * canvas.height;

const drawPitch = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the pitch lines
    drawLine(0, 0, 80, 0);
    drawLine(0, 0, 0, 140);
    drawLine(0, 140, 80, 140);
    drawLine(80, 0, 80, 140);
    drawLine(0, 14, 80, 14);
    drawLine(0, 21, 80, 21);
    drawLine(0, 45, 80, 45);
    drawLine(0, 65, 80, 65);
    drawLine(0, 75, 80, 75);
    drawLine(0, 95, 80, 95);
    drawLine(0, 119, 80, 119);
    drawLine(0, 126, 80, 126);
    drawLine(35, 70, 45, 70);
    drawLine(32.5, 0, 32.5, 5);
    drawLine(47.5, 0, 47.5, 5);
    drawLine(32.5, 5, 47.5, 5);
    drawLine(30, 0, 30, 14);
    drawLine(50, 0, 50, 14);
    drawLine(32.5, 140, 32.5, 135);
    drawLine(47.5, 140, 47.5, 135);
    drawLine(32.5, 135, 47.5, 135);
    drawLine(30, 140, 30, 126);
    drawLine(50, 140, 50, 126);
    drawLine(36.5, 0, 36.5, -3);
    drawLine(43.5, 0, 43.5, -3);
    drawLine(36.5, -3, 43.5, -3);
    drawLine(36.5, 140, 36.5, 143);
    drawLine(43.5, 140, 43.5, 143);
    drawLine(36.5, 143, 43.5, 143);
    // Draw the rotated semicircle
    drawRotatedSemicircle(rotatedSemicircle);
    // Draw the clockwise rotated semicircle
    drawClockwiseRotatedSemicircle(clockwiseRotatedSemicircle);
    // Arc at the bottom
    arcBottom = generateArcPoints(40, 0, 40, Math.atan2(21 - 0, 6 - 40), Math.atan2(21 - 0, 74 - 40), 100);
    drawArc(arcBottom);
    // Arc at the top
    arcTop = generateArcPoints(40, 140, 40, Math.atan2(119 - 140, 74 - 40), Math.atan2(119 - 140, 6 - 40), 100);
    drawArc(arcTop);
}

function generateRotatedSemicircle(centerX, centerY, radius, points) {
    const theta = Array.from({ length: points }, (_, i) => Math.PI + (i / (points - 1)) * Math.PI);
    const x = theta.map(t => centerX + radius * Math.cos(t));
    const y = theta.map(t => centerY + radius * Math.sin(t));
    return x.map((xi, i) => ({ x: xi, y: y[i] }));
}

// Generate rotated semicircle coordinates
const rotatedSemicircle = generateRotatedSemicircle(40, 119, 13, 100);

// Function to draw the rotated semicircle
function drawRotatedSemicircle(semicircle) {
    ctx.beginPath();
    semicircle.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(mapX(point.x), mapY(point.y));
        } else {
            ctx.lineTo(mapX(point.x), mapY(point.y));
        }
    });
    ctx.stroke();
}

function generateClockwiseRotatedSemicircle(centerX, centerY, radius, points) {
    const theta = Array.from({ length: points }, (_, i) => Math.PI + (i / (points - 1)) * Math.PI);
    const x = theta.map(t => centerX - radius * Math.cos(t));
    const y = theta.map(t => centerY - radius * Math.sin(t));
    return x.map((xi, i) => ({ x: xi, y: y[i] }));
}

// Generate clockwise rotated semicircle coordinates
const clockwiseRotatedSemicircle = generateClockwiseRotatedSemicircle(40, 21, 13, 100);

// Function to draw the clockwise rotated semicircle
function drawClockwiseRotatedSemicircle(semicircle) {
    ctx.beginPath();
    semicircle.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(mapX(point.x), mapY(point.y));
        } else {
            ctx.lineTo(mapX(point.x), mapY(point.y));
        }
    });
    ctx.stroke();
}

// Function to generate arc points (helper function)
const generateArcPoints = (centerX, centerY, radius, startAngle, endAngle, points) => {
    const arcPoints = [];
    const thetaStep = (endAngle - startAngle) / (points - 1);
    
    for (let i = 0; i < points; i++) {
        const theta = startAngle + i * thetaStep;
        const x = centerX + radius * Math.cos(theta);
        const y = centerY + radius * Math.sin(theta);
        arcPoints.push({ x, y });
    }
    return arcPoints;
};

// Function to draw arc on the canvas
const drawArc = (arcPoints) => {
    ctx.beginPath();
    arcPoints.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(mapX(point.x), mapY(point.y));
        } else {
            ctx.lineTo(mapX(point.x), mapY(point.y));
        }
    });
    ctx.stroke();
};

// Similar logic to the drawPitch function
const drawReviewArc = (arcPoints) => {
    reviewCtx.beginPath();
    arcPoints.forEach((point, index) => {
        if (index === 0) {
            reviewCtx.moveTo(mapXReview(point.x), mapYReview(point.y));
        } else {
            reviewCtx.lineTo(mapXReview(point.x), mapYReview(point.y));
        }
    });
    reviewCtx.stroke();
};

// Draw the marker
const drawMarker = (x, y, color) => {
    ctx.beginPath();
    ctx.arc(mapX(x), mapY(y), 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
};

// Initial draw
drawPitch();

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 80;
    const y = 140 - ((e.clientY - rect.top) / canvas.height) * 140;
    
    if (gridSelectionActive) {
        // GRID mode: compute grid area and highlight
        const gridId = getGridFromPoint(x, y);
        if (gridId) {
            selectedGrid = gridId;
            drawPitch();
            drawGridHighlight(gridId);
            const disp1 = document.getElementById('coordinate-display-1');
            const disp2 = document.getElementById('coordinate-display-2');
            if (disp1) disp1.textContent = `Selected: ${gridId}`;
            if (disp2) disp2.style.display = 'none';
        }
        return;
    }

    // 💡 Restrict 2-Point - Score to valid locations
    if (currentAction === '2-Point - Score' && !isValid2PointLocation(x, y)) {
        showCoordinateWarning('Invalid location: 2-point scores must be outside both arcs and between the 21m lines.');
        return;
    }

    if (!firstMarkerConfirmed) {
        marker1.x = x.toFixed(2);
        marker1.y = y.toFixed(2);
        drawPitch();
        drawMarker(marker1.x, marker1.y, 'blue'); // First marker in blue
        document.getElementById('coordinate-display-1').textContent = `X1: ${marker1.x}, Y1: ${marker1.y}`;
    } else {
        marker2.x = x.toFixed(2);
        marker2.y = y.toFixed(2);
        drawPitch();
        drawMarker(marker1.x, marker1.y, 'blue'); // Redraw the first marker
        drawMarker(marker2.x, marker2.y, 'red'); // Second marker in red
        document.getElementById('coordinate-display-2').textContent = `X2: ${marker2.x}, Y2: ${marker2.y}`;
    }
});

// --- code for 2-Point coordinates ---
// arcTop is now defined globally in drawPitch function

function isPointInsidePolygon(x, y, polygonPoints) {
    let inside = false;
    for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
        const xi = polygonPoints[i].x, yi = polygonPoints[i].y;
        const xj = polygonPoints[j].x, yj = polygonPoints[j].y;

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function isValid2PointLocation(x, y) {
    // y must be ≤ 119 (outside the 21 line at top)
    const beyond21LineTop = y <= 119;
    
    // y must be ≥ 21 (outside the 21 line at bottom)
    const beyond21LineBottom = y >= 21;

    // Cannot be inside the top arc
    const insideTopArc = isPointInsidePolygon(x, y, arcTop);
    
    // Cannot be inside the bottom arc
    const insideBottomArc = isPointInsidePolygon(x, y, arcBottom);

    return beyond21LineTop && beyond21LineBottom && !insideTopArc && !insideBottomArc;
}

// Warning for invalid 2-pointer
function showCoordinateWarning(message) {
    const warningBox = document.getElementById('coordinate-warning');
    warningBox.textContent = message;
    warningBox.classList.add('show');

    setTimeout(() => {
        warningBox.classList.remove('show');
    }, 1000); // 1 second
}

// Update coordinate screen UI for grid vs coordinates
function updateCoordinateScreenMode() {
    try {
        const confirmBtn = document.getElementById('confirmCoordinatesButton');
        const disp1 = document.getElementById('coordinate-display-1');
        const disp2 = document.getElementById('coordinate-display-2');
        if (gridSelectionActive) {
            if (confirmBtn) confirmBtn.textContent = 'Confirm Area';
            if (disp1) disp1.textContent = 'Select a grid area';
            if (disp2) disp2.style.display = 'none';
            drawPitch(); // clear markers
            selectedGrid = null;
        } else {
            if (confirmBtn) confirmBtn.textContent = 'Confirm Coordinates';
            if (disp1) disp1.textContent = 'X1: -, Y1: -';
            if (disp2) disp2.textContent = 'X2: -, Y2: -';
        }
    } catch (e) {
        console.error('updateCoordinateScreenMode failed', e);
    }
}

// GRID actions list
const GRID_ACTIONS = new Set([
    'Point - Score',
    '2-Point - Score',
    'Goal - Score',
    'Point - Miss',
    'Goal - Miss',
    '45 Entry',
    'Our Kickout',
    'Opp. Kickout',
    'Free Won',
    'Ball Lost (Forced)',
    'Ball Lost (Unforced)',
    'Ball Won (Forced)',
    'Ball Won (Unforced)',
    'Foul Committed',
    'Opp. 45 Entry'
]);

// Compute GRID id from normalized pitch coords
function getGridFromPoint(x, y) {
    // Layer 3: small semicircles (highest priority)
    const rSmall = 13;
    const d2Bottom = (x - 40) * (x - 40) + (y - 21) * (y - 21);
    const d2Top = (x - 40) * (x - 40) + (y - 119) * (y - 119);
    const insideSmallBottom = d2Bottom <= rSmall * rSmall && y >= 21; // face on y=21, interior towards y>=21
    const insideSmallTop = d2Top <= rSmall * rSmall && y <= 119;      // face on y=119, interior towards y<=119
    if (insideSmallBottom) return 'GRID4';
    if (insideSmallTop) return 'GRID19';

    // Layer 2: big arcs (middle priority)
    const insideTopArc = isPointInsidePolygon(x, y, arcTop);
    const insideBottomArc = isPointInsidePolygon(x, y, arcBottom);
    if (insideBottomArc && y >= 0 && y <= 45) {
        if (x < 40) return 'GRID5';
        if (x > 40) return 'GRID6';
        return 'GRID5';
    }
    if (insideTopArc && y >= 95 && y <= 140) {
        if (x < 40) return 'GRID20';
        if (x > 40) return 'GRID21';
        return 'GRID20';
    }

    // Layer 1: rectangles (lowest priority)
    const col3 = (x < 25) ? 0 : (x < 55) ? 1 : 2;
    if (y >= 0 && y < 21) {
        return ['GRID1','GRID2','GRID3'][col3];
    }
    if (y >= 21 && y < 45) {
        return ['GRID7','GRID8','GRID9'][col3];
    }
    if (y >= 45 && y < 70) {
        return ['GRID10','GRID11','GRID12'][col3];
    }
    if (y >= 70 && y < 95) {
        return ['GRID13','GRID14','GRID15'][col3];
    }
    if (y >= 95 && y < 119) {
        return ['GRID16','GRID17','GRID18'][col3];
    }
    if (y >= 119 && y <= 140) {
        return ['GRID22','GRID23','GRID24'][col3];
    }
    return null;
}

// Draw highlight for selected GRID area
function drawGridHighlight(gridId) {
    // Compose highlight offscreen so we don't affect pitch lines
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const offCtx = off.getContext('2d');
    const drawCtx = offCtx;
    drawCtx.globalAlpha = 0.28;
    drawCtx.fillStyle = '#f97316'; // bright orange

    // Path builders using Path2D for reliable compositing
    const buildRectPath = (x0, y0, x1, y1) => {
        const p = new Path2D();
        const x = mapX(Math.min(x0, x1));
        const y = mapY(Math.max(y0, y1));
        const w = Math.abs(mapX(x1) - mapX(x0));
        const h = Math.abs(mapY(y0) - mapY(y1));
        p.rect(x, y, w, h);
        return p;
    };

    const buildArcRegionPath = (points, chordY, half) => {
        const filtered = (half === 'left') ? points.filter(p => p.x <= 40) : (half === 'right') ? points.filter(p => p.x >= 40) : points;
        if (!filtered.length) return null;
        const p = new Path2D();
        p.moveTo(mapX(filtered[0].x), mapY(filtered[0].y));
        for (let i = 1; i < filtered.length; i++) {
            p.lineTo(mapX(filtered[i].x), mapY(filtered[i].y));
        }
        const last = filtered[filtered.length - 1];
        const first = filtered[0];
        p.lineTo(mapX(last.x), mapY(chordY));
        p.lineTo(mapX(first.x), mapY(chordY));
        p.closePath();
        return p;
    };

    const buildSmallSemiPath = (pts, chordY) => {
        const p = new Path2D();
        p.moveTo(mapX(pts[0].x), mapY(pts[0].y));
        for (let i = 1; i < pts.length; i++) {
            p.lineTo(mapX(pts[i].x), mapY(pts[i].y));
        }
        const last = pts[pts.length - 1];
        const first = pts[0];
        p.lineTo(mapX(last.x), mapY(chordY));
        p.lineTo(mapX(first.x), mapY(chordY));
        p.closePath();
        return p;
    };

    switch (gridId) {
        case 'GRID4': {
            const path = buildSmallSemiPath(clockwiseRotatedSemicircle, 21);
            drawCtx.fill(path);
            break;
        }
        case 'GRID5': {
            const arcPath = buildArcRegionPath(arcBottom, 21, 'left');
            if (arcPath) {
                drawCtx.fill(arcPath);
                // fully subtract semicircle (use alpha=1 during cutout)
                const prevAlpha = drawCtx.globalAlpha;
                drawCtx.globalCompositeOperation = 'destination-out';
                drawCtx.globalAlpha = 1;
                drawCtx.fill(buildSmallSemiPath(clockwiseRotatedSemicircle, 21));
                drawCtx.globalAlpha = prevAlpha;
                drawCtx.globalCompositeOperation = 'source-over';
            }
            break;
        }
        case 'GRID6': {
            const arcPath = buildArcRegionPath(arcBottom, 21, 'right');
            if (arcPath) {
                drawCtx.fill(arcPath);
                const prevAlpha = drawCtx.globalAlpha;
                drawCtx.globalCompositeOperation = 'destination-out';
                drawCtx.globalAlpha = 1;
                drawCtx.fill(buildSmallSemiPath(clockwiseRotatedSemicircle, 21));
                drawCtx.globalAlpha = prevAlpha;
                drawCtx.globalCompositeOperation = 'source-over';
            }
            break;
        }
        case 'GRID19': {
            const path = buildSmallSemiPath(rotatedSemicircle, 119);
            drawCtx.fill(path);
            break;
        }
        case 'GRID20': {
            const arcPath = buildArcRegionPath(arcTop, 119, 'left');
            if (arcPath) {
                drawCtx.fill(arcPath);
                const prevAlpha = drawCtx.globalAlpha;
                drawCtx.globalCompositeOperation = 'destination-out';
                drawCtx.globalAlpha = 1;
                drawCtx.fill(buildSmallSemiPath(rotatedSemicircle, 119));
                drawCtx.globalAlpha = prevAlpha;
                drawCtx.globalCompositeOperation = 'source-over';
            }
            break;
        }
        case 'GRID21': {
            const arcPath = buildArcRegionPath(arcTop, 119, 'right');
            if (arcPath) {
                drawCtx.fill(arcPath);
                const prevAlpha = drawCtx.globalAlpha;
                drawCtx.globalCompositeOperation = 'destination-out';
                drawCtx.globalAlpha = 1;
                drawCtx.fill(buildSmallSemiPath(rotatedSemicircle, 119));
                drawCtx.globalAlpha = prevAlpha;
                drawCtx.globalCompositeOperation = 'source-over';
            }
            break;
        }
        default: {
            // Rectangular regions
            const id = gridId.replace('GRID','')*1;
            let rectPath = null;
            if (id >= 1 && id <= 3) {
                const col = id - 1; // 0..2
                const xStarts = [0, 25, 55];
                const xEnds = [25, 55, 80];
                rectPath = buildRectPath(xStarts[col], 0, xEnds[col], 21);
            } else if (id >= 7 && id <= 9) {
                const col = id - 7; // 0..2
                const xStarts = [0, 25, 55];
                const xEnds = [25, 55, 80];
                rectPath = buildRectPath(xStarts[col], 21, xEnds[col], 45);
            } else if (id >= 10 && id <= 12) {
                const col = id - 10; // 0..2
                const xStarts = [0, 25, 55];
                const xEnds = [25, 55, 80];
                rectPath = buildRectPath(xStarts[col], 45, xEnds[col], 70);
            } else if (id >= 13 && id <= 15) {
                const col = id - 13; // 0..2
                const xStarts = [0, 25, 55];
                const xEnds = [25, 55, 80];
                rectPath = buildRectPath(xStarts[col], 70, xEnds[col], 95);
            } else if (id >= 16 && id <= 18) {
                const col = id - 16; // 0..2
                const xStarts = [0, 25, 55];
                const xEnds = [25, 55, 80];
                rectPath = buildRectPath(xStarts[col], 95, xEnds[col], 119);
            } else if (id >= 22 && id <= 24) {
                const col = id - 22; // 0..2
                const xStarts = [0, 25, 55];
                const xEnds = [25, 55, 80];
                rectPath = buildRectPath(xStarts[col], 119, xEnds[col], 140);
            }

            if (rectPath) {
                drawCtx.fill(rectPath);
                // subtract arc and small semicircle masks (full alpha cutout)
                drawCtx.globalCompositeOperation = 'destination-out';
                const prevAlpha = drawCtx.globalAlpha;
                drawCtx.globalAlpha = 1;
                const bottomArcFull = buildArcRegionPath(arcBottom, 21, null);
                const topArcFull = buildArcRegionPath(arcTop, 119, null);
                if (bottomArcFull) drawCtx.fill(bottomArcFull);
                if (topArcFull) drawCtx.fill(topArcFull);
                drawCtx.fill(buildSmallSemiPath(clockwiseRotatedSemicircle, 21));
                drawCtx.fill(buildSmallSemiPath(rotatedSemicircle, 119));
                drawCtx.globalAlpha = prevAlpha;
                drawCtx.globalCompositeOperation = 'source-over';
            }
        }
    }
    // Paint composed highlight over pitch
    ctx.drawImage(off, 0, 0);
}
confirmCoordinatesButton.addEventListener('click', () => {
    try {
        if (gridSelectionActive) {
            if (!selectedGrid) {
                showCoordinateWarning('Please select a grid area');
                return;
            }
            currentCoordinates1 = selectedGrid;
            currentCoordinates2 = selectedGrid;
            // Log immediately for grid mode
            logAction();
            return;
        }

        if (currentAction === 'Handpass' || currentAction === 'Kickpass' || currentAction === 'Carry') {
            if (!firstMarkerConfirmed) {
                if (marker1.x !== null && marker1.y !== null) {
                    currentCoordinates1 = `(${marker1.x}, ${marker1.y})`;
                    firstMarkerConfirmed = true;
                    document.getElementById('coordinate-display-2').style.display = 'block'; // Show second coordinate display
                } else {
                    alert('Please place a marker on the pitch.');
                }
            } else {
                if (marker2.x !== null && marker2.y !== null) {
                    currentCoordinates2 = `(${marker2.x}, ${marker2.y})`;
                    // For Handpass, Kickpass, and Carry, log the action directly after second coordinate
                    logAction();
                } else {
                    alert('Please place the second marker on the pitch.');
                }
            }
        } else {
            if (marker1.x !== null && marker1.y !== null) {
                currentCoordinates1 = `(${marker1.x}, ${marker1.y})`;

                // For opposition tracking actions, log immediately without player selection
                if (
                    currentAction === 'Point - Against' ||
                    currentAction === '2-Point - Against' ||
                    currentAction === 'Goal - Against' ||
                    currentAction === 'Miss - Against'
                ) {
                    logAction();
                } else {
                    // For actions that already went through player selection, log the action directly
                    logAction();
                }
            } else {
                alert('Please place a marker on the pitch.');
            }
        }
    } catch (error) {
        console.error('Error in coordinate confirmation:', error);
        alert('An error occurred while confirming coordinates. Please try again.');
    }
});

function toggleCoordinates() {
    const settingsCoords = document.getElementById('settings-toggle-coordinates');
    const headerCoords = document.getElementById('toggle-coordinates');
    const isChecked = settingsCoords ? settingsCoords.checked : (headerCoords ? headerCoords.checked : false);
    coordinatesEnabled = !!isChecked;
    if (coordinatesEnabled) {
        gridEnabled = false;
        const gridToggle = document.getElementById('toggle-grid');
        if (gridToggle) gridToggle.checked = false;
        const settingsGrid = document.getElementById('settings-toggle-grid');
        if (settingsGrid) settingsGrid.checked = false;
        document.body.classList.remove('grid-mode');
    }
    syncToggleViews();
}

// Settings popup open/close
function openSettingsPopup() {
    const el = document.getElementById('settings-popup');
    if (el) {
        syncToggleViews();
        PopupAnimator.showPopup(el, 'standard');
    }
}

function closeSettingsPopup() {
    const el = document.getElementById('settings-popup');
    if (el) PopupAnimator.hidePopup(el, 'standard');
}

// Synchronize header and settings toggles both ways
function syncToggleViews() {
    const headerCoords = document.getElementById('toggle-coordinates');
    const headerGrid = document.getElementById('toggle-grid');
    const settingsCoords = document.getElementById('settings-toggle-coordinates');
    const settingsGrid = document.getElementById('settings-toggle-grid');
    const darkMode = document.getElementById('toggle-dark-mode');
    const settingsDark = document.getElementById('settings-toggle-dark-mode');

    // Determine current truth from state, then mirror to whichever controls exist
    let coordsState = typeof coordinatesEnabled === 'boolean' ? coordinatesEnabled : false;
    let gridState = typeof gridEnabled === 'boolean' ? gridEnabled : false;

    // If header exists, prefer its live checked state
    if (headerCoords) coordsState = headerCoords.checked;
    if (headerGrid) gridState = headerGrid.checked;

    // Enforce mutual exclusion in state
    if (coordsState && gridState) {
        // prefer the one just toggled; if ambiguous, disable grid
        gridState = false;
    }

    // Push state to settings and header controls if present
    if (settingsCoords) settingsCoords.checked = coordsState;
    if (settingsGrid) settingsGrid.checked = gridState;
    if (headerCoords) headerCoords.checked = coordsState;
    if (headerGrid) headerGrid.checked = gridState;

    // Keep internal flags aligned
    coordinatesEnabled = coordsState;
    gridEnabled = gridState;

    // Dark mode sync
    if (settingsDark && darkMode) settingsDark.checked = darkMode.checked;
}

function onSettingsToggleCoordinates() {
    const settingsCoords = document.getElementById('settings-toggle-coordinates');
    const headerCoords = document.getElementById('toggle-coordinates');
    if (headerCoords && settingsCoords) headerCoords.checked = settingsCoords.checked;
    toggleCoordinates();
}

function onSettingsToggleGrid() {
    const settingsGrid = document.getElementById('settings-toggle-grid');
    const headerGrid = document.getElementById('toggle-grid');
    if (headerGrid && settingsGrid) headerGrid.checked = settingsGrid.checked;
    toggleGrid();
}

function onSettingsToggleDarkMode() {
    const settingsDark = document.getElementById('settings-toggle-dark-mode');
    const headerDark = document.getElementById('toggle-dark-mode');
    if (headerDark && settingsDark) headerDark.checked = settingsDark.checked;
    toggleDarkMode();
}

function resetCoordinateScreen() {
    marker1 = { x: null, y: null };
    marker2 = { x: null, y: null };
    firstMarkerConfirmed = false;
    selectedGrid = null;
    document.getElementById('coordinate-display-1').textContent = 'X1: -, Y1: -';
    document.getElementById('coordinate-display-2').textContent = 'X2: -, Y2: -';
    document.getElementById('coordinate-display-2').style.display = 'none';
    drawPitch(); // Redraw the pitch to clear markers
}


const reviewCanvas = document.getElementById('review-pitch');
const reviewCtx = reviewCanvas.getContext('2d');

const drawReviewPitch = () => {
    reviewCtx.clearRect(0, 0, reviewCanvas.width, reviewCanvas.height);

    const drawReviewLine = (startX, startY, endX, endY) => {
        reviewCtx.beginPath();
        reviewCtx.moveTo(mapXReview(startX), mapYReview(startY));
        reviewCtx.lineTo(mapXReview(endX), mapYReview(endY));
        reviewCtx.strokeStyle = 'black';  // Ensure the line color is black
        reviewCtx.stroke();
    };

    drawReviewLine(0, 0, 80, 0);
    drawReviewLine(0, 0, 0, 140);
    drawReviewLine(0, 140, 80, 140);
    drawReviewLine(80, 0, 80, 140);
    drawReviewLine(0, 14, 80, 14);
    drawReviewLine(0, 21, 80, 21);
    drawReviewLine(0, 45, 80, 45);
    drawReviewLine(0, 65, 80, 65);
    drawReviewLine(0, 75, 80, 75);
    drawReviewLine(0, 95, 80, 95);
    drawReviewLine(0, 119, 80, 119);
    drawReviewLine(0, 126, 80, 126);
    drawReviewLine(35, 70, 45, 70);
    drawReviewLine(32.5, 0, 32.5, 5);
    drawReviewLine(47.5, 0, 47.5, 5);
    drawReviewLine(32.5, 5, 47.5, 5);
    drawReviewLine(30, 0, 30, 14);
    drawReviewLine(50, 0, 50, 14);
    drawReviewLine(32.5, 140, 32.5, 135);
    drawReviewLine(47.5, 140, 47.5, 135);
    drawReviewLine(32.5, 135, 47.5, 135);
    drawReviewLine(30, 140, 30, 126);
    drawReviewLine(50, 140, 50, 126);
    drawReviewLine(36.5, 0, 36.5, -3);
    drawReviewLine(43.5, 0, 43.5, -3);
    drawReviewLine(36.5, -3, 43.5, -3);
    drawReviewLine(36.5, 140, 36.5, 143);
    drawReviewLine(43.5, 140, 43.5, 143);
    drawReviewLine(36.5, 143, 43.5, 143);

    drawReviewRotatedSemicircle(rotatedSemicircle);
    drawReviewClockwiseRotatedSemicircle(clockwiseRotatedSemicircle);

    // Arc at the bottom
    arcBottom = generateArcPoints(40, 0, 40, Math.atan2(21 - 0, 6 - 40), Math.atan2(21 - 0, 74 - 40), 100);
    drawReviewArc(arcBottom);

    // Arc at the top
    arcTop = generateArcPoints(40, 140, 40, Math.atan2(119 - 140, 74 - 40), Math.atan2(119 - 140, 6 - 40), 100);
    drawReviewArc(arcTop);
};

const drawReviewRotatedSemicircle = (semicircle) => {
    reviewCtx.beginPath();
    semicircle.forEach((point, index) => {
        if (index === 0) {
            reviewCtx.moveTo(mapXReview(point.x), mapYReview(point.y));
        } else {
            reviewCtx.lineTo(mapXReview(point.x), mapYReview(point.y));
        }
    });
    reviewCtx.strokeStyle = 'black';  // Ensure the line color is black
    reviewCtx.stroke();
};

const drawReviewClockwiseRotatedSemicircle = (semicircle) => {
    reviewCtx.beginPath();
    semicircle.forEach((point, index) => {
        if (index === 0) {
            reviewCtx.moveTo(mapXReview(point.x), mapYReview(point.y));
        } else {
            reviewCtx.lineTo(mapXReview(point.x), mapYReview(point.y));
        }
    });
    reviewCtx.strokeStyle = 'black';  // Ensure the line color is black
    reviewCtx.stroke();
};

const mapXReview = x => (x / 80) * reviewCanvas.width;
const mapYReview = y => reviewCanvas.height - (y / 140) * reviewCanvas.height;

let reviewMarkers = []; // Store marker positions

const drawReviewMarker = (x, y, color, entry, actionType, markerType = 'circle') => {
    reviewCtx.beginPath();
    if (markerType === 'circle') {
        reviewCtx.arc(mapXReview(x), mapYReview(y), 5, 0, Math.PI * 2);
        reviewCtx.fillStyle = color;
        reviewCtx.fill();
    } else if (markerType === 'cross') {
        reviewCtx.moveTo(mapXReview(x) - 5, mapYReview(y) - 5);
        reviewCtx.lineTo(mapXReview(x) + 5, mapYReview(y) + 5);
        reviewCtx.moveTo(mapXReview(x) + 5, mapYReview(y) - 5);
        reviewCtx.lineTo(mapXReview(x) - 5, mapYReview(y) + 5);
        reviewCtx.strokeStyle = color;
        reviewCtx.stroke();
    } else if (markerType === 'square') {
        reviewCtx.rect(mapXReview(x) - 5, mapYReview(y) - 5, 10, 10);
        reviewCtx.fillStyle = color;
        reviewCtx.fill();
    } else if (markerType === 'hollowCircle') {
        reviewCtx.arc(mapXReview(x), mapYReview(y), 5, 0, Math.PI * 2);
        reviewCtx.strokeStyle = color;
        reviewCtx.stroke();
    } else if (markerType === 'triangle') {
    // Clear path and explicitly move through 3 points
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY - 6);       // Top
        reviewCtx.lineTo(mappedX - 5, mappedY + 4);    // Bottom left
        reviewCtx.lineTo(mappedX + 5, mappedY + 4);    // Bottom right
        reviewCtx.closePath();                         // Back to top
        reviewCtx.fillStyle = color;
        reviewCtx.fill();
    } else if (markerType === 'diamond') {
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY - 6);        // Top
        reviewCtx.lineTo(mappedX - 5, mappedY);        // Left
        reviewCtx.lineTo(mappedX, mappedY + 6);        // Bottom
        reviewCtx.lineTo(mappedX + 5, mappedY);        // Right
        reviewCtx.closePath();                         // Back to top
        reviewCtx.fillStyle = color;
        reviewCtx.fill();
    } else if (markerType === 'pointScore') {
        // Draw solid dark green circle (no border)
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        reviewCtx.beginPath();
        reviewCtx.arc(mappedX, mappedY, 5, 0, Math.PI * 2);
        reviewCtx.fillStyle = '#065f46'; // Very dark green fill
        reviewCtx.fill();
    } else if (markerType === 'twoPointScore') {
        // Draw double-ring green circle (bullseye effect)
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        // Outer ring (larger circle, hollow)
        reviewCtx.beginPath();
        reviewCtx.arc(mappedX, mappedY, 8, 0, Math.PI * 2);
        reviewCtx.strokeStyle = '#065f46';
        reviewCtx.lineWidth = 2;
        reviewCtx.stroke();
        // Inner ring (smaller circle, filled)
        reviewCtx.beginPath();
        reviewCtx.arc(mappedX, mappedY, 4, 0, Math.PI * 2);
        reviewCtx.fillStyle = '#065f46';
        reviewCtx.fill();
        // Reset line width to default
        reviewCtx.lineWidth = 1;
    } else if (markerType === 'goalScore') {
        // Draw filled green star
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const spikes = 5;
        const outerRadius = 6;
        const innerRadius = 3;
        
        reviewCtx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = mappedX + Math.cos(angle) * radius;
            const y = mappedY + Math.sin(angle) * radius;
            if (i === 0) {
                reviewCtx.moveTo(x, y);
            } else {
                reviewCtx.lineTo(x, y);
            }
        }
        reviewCtx.closePath();
        reviewCtx.fillStyle = '#065f46';
        reviewCtx.fill();
    } else if (markerType === 'pointMiss') {
        // Draw open red circle (hollow with thick walls)
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        reviewCtx.beginPath();
        reviewCtx.arc(mappedX, mappedY, 5, 0, Math.PI * 2);
        reviewCtx.strokeStyle = '#dc2626'; // Red color
        reviewCtx.lineWidth = 3; // Thick walls for visibility
        reviewCtx.stroke();
        // Reset line width to default
        reviewCtx.lineWidth = 1;
    } else if (markerType === 'goalMiss') {
        // Draw red outlined star (hollow with thick walls)
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const spikes = 5;
        const outerRadius = 6;
        const innerRadius = 3;
        
        reviewCtx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = mappedX + Math.cos(angle) * radius;
            const y = mappedY + Math.sin(angle) * radius;
            if (i === 0) {
                reviewCtx.moveTo(x, y);
            } else {
                reviewCtx.lineTo(x, y);
            }
        }
        reviewCtx.closePath();
        reviewCtx.strokeStyle = '#dc2626'; // Red color
        reviewCtx.lineWidth = 3; // Thick walls for visibility
        reviewCtx.stroke();
        // Reset line width to default
        reviewCtx.lineWidth = 1;
    } else if (markerType === 'kickoutWonUncontested') {
        // Draw blue filled circle
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const radius = 6;
        
        reviewCtx.beginPath();
        reviewCtx.arc(mappedX, mappedY, radius, 0, Math.PI * 2);
        reviewCtx.fillStyle = 'blue';
        reviewCtx.fill();
    } else if (markerType === 'kickoutWonContested') {
        // Draw blue filled diamond
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY - size); // Top
        reviewCtx.lineTo(mappedX + size, mappedY); // Right
        reviewCtx.lineTo(mappedX, mappedY + size); // Bottom
        reviewCtx.lineTo(mappedX - size, mappedY); // Left
        reviewCtx.closePath();
        reviewCtx.fillStyle = 'blue';
        reviewCtx.fill();
    } else if (markerType === 'kickoutLostUncontested') {
        // Draw black hollow circle with X inside
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const radius = 6;
        
        // Draw hollow circle
        reviewCtx.beginPath();
        reviewCtx.arc(mappedX, mappedY, radius, 0, Math.PI * 2);
        reviewCtx.strokeStyle = 'black';
        reviewCtx.lineWidth = 2;
        reviewCtx.stroke();
        
        // Draw X inside
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX - 4, mappedY - 4);
        reviewCtx.lineTo(mappedX + 4, mappedY + 4);
        reviewCtx.moveTo(mappedX + 4, mappedY - 4);
        reviewCtx.lineTo(mappedX - 4, mappedY + 4);
        reviewCtx.strokeStyle = 'black';
        reviewCtx.lineWidth = 2;
        reviewCtx.stroke();
        
        // Reset line width to default
        reviewCtx.lineWidth = 1;
    } else if (markerType === 'kickoutLostContested') {
        // Draw black hollow diamond with X inside
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        // Draw hollow diamond
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY - size); // Top
        reviewCtx.lineTo(mappedX + size, mappedY); // Right
        reviewCtx.lineTo(mappedX, mappedY + size); // Bottom
        reviewCtx.lineTo(mappedX - size, mappedY); // Left
        reviewCtx.closePath();
        reviewCtx.strokeStyle = 'black';
        reviewCtx.lineWidth = 2;
        reviewCtx.stroke();
        
        // Draw X inside
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX - 4, mappedY - 4);
        reviewCtx.lineTo(mappedX + 4, mappedY + 4);
        reviewCtx.moveTo(mappedX + 4, mappedY - 4);
        reviewCtx.lineTo(mappedX - 4, mappedY + 4);
        reviewCtx.strokeStyle = 'black';
        reviewCtx.lineWidth = 2;
        reviewCtx.stroke();
        
        // Reset line width to default
        reviewCtx.lineWidth = 1;
    } else if (markerType === 'kickoutTeam2WonUncontested') {
        // Draw black filled circle
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const radius = 6;
        
        reviewCtx.beginPath();
        reviewCtx.arc(mappedX, mappedY, radius, 0, Math.PI * 2);
        reviewCtx.fillStyle = 'black';
        reviewCtx.fill();
    } else if (markerType === 'kickoutTeam2WonContested') {
        // Draw black filled diamond
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY - size); // Top
        reviewCtx.lineTo(mappedX + size, mappedY); // Right
        reviewCtx.lineTo(mappedX, mappedY + size); // Bottom
        reviewCtx.lineTo(mappedX - size, mappedY); // Left
        reviewCtx.closePath();
        reviewCtx.fillStyle = 'black';
        reviewCtx.fill();
    } else if (markerType === 'kickoutTeam2LostUncontested') {
        // Draw blue filled circle
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const radius = 6;
        
        reviewCtx.beginPath();
        reviewCtx.arc(mappedX, mappedY, radius, 0, Math.PI * 2);
        reviewCtx.fillStyle = 'blue';
        reviewCtx.fill();
    } else if (markerType === 'kickoutTeam2LostContested') {
        // Draw blue filled diamond
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY - size); // Top
        reviewCtx.lineTo(mappedX + size, mappedY); // Right
        reviewCtx.lineTo(mappedX, mappedY + size); // Bottom
        reviewCtx.lineTo(mappedX - size, mappedY); // Left
        reviewCtx.closePath();
        reviewCtx.fillStyle = 'blue';
        reviewCtx.fill();
    } else if (markerType === 'freeWon') {
        // Draw turquoise rounded hexagon
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        reviewCtx.beginPath();
        
        // Create rounded hexagon by drawing 6 points with rounded corners
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3; // 60 degrees between each point
            const xPos = mappedX + Math.cos(angle) * size;
            const yPos = mappedY + Math.sin(angle) * size;
            
            if (i === 0) {
                reviewCtx.moveTo(xPos, yPos);
            } else {
                reviewCtx.lineTo(xPos, yPos);
            }
        }
        
        reviewCtx.closePath();
        reviewCtx.fillStyle = '#14b8a6'; // Turquoise color
        reviewCtx.fill();
    } else if (markerType === 'ballLostForced') {
        // Draw red-orange downward triangle
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY - size); // Top point
        reviewCtx.lineTo(mappedX - size, mappedY + size); // Bottom left
        reviewCtx.lineTo(mappedX + size, mappedY + size); // Bottom right
        reviewCtx.closePath();
        reviewCtx.fillStyle = '#ea580c'; // Red-orange color
        reviewCtx.fill();
    } else if (markerType === 'ballLostUnforced') {
        // Draw red-orange hollow triangle
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY - size); // Top point
        reviewCtx.lineTo(mappedX - size, mappedY + size); // Bottom left
        reviewCtx.lineTo(mappedX + size, mappedY + size); // Bottom right
        reviewCtx.closePath();
        reviewCtx.strokeStyle = '#ea580c'; // Red-orange color
        reviewCtx.lineWidth = 2;
        reviewCtx.stroke();
        // Reset line width to default
        reviewCtx.lineWidth = 1;
    } else if (markerType === 'ballWonForced') {
        // Draw royal blue filled upward triangle
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY + size); // Bottom point
        reviewCtx.lineTo(mappedX - size, mappedY - size); // Top left
        reviewCtx.lineTo(mappedX + size, mappedY - size); // Top right
        reviewCtx.closePath();
        reviewCtx.fillStyle = '#1e40af'; // Royal blue color
        reviewCtx.fill();
    } else if (markerType === 'ballWonUnforced') {
        // Draw royal blue hollow upward triangle
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        reviewCtx.beginPath();
        reviewCtx.moveTo(mappedX, mappedY + size); // Bottom point
        reviewCtx.lineTo(mappedX - size, mappedY - size); // Top left
        reviewCtx.lineTo(mappedX + size, mappedY - size); // Top right
        reviewCtx.closePath();
        reviewCtx.strokeStyle = '#1e40af'; // Royal blue color
        reviewCtx.lineWidth = 2;
        reviewCtx.stroke();
        // Reset line width to default
        reviewCtx.lineWidth = 1;
    } else if (markerType === 'foulCommittedPhysical') {
        // Draw deep purple filled square with white dot
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        // Draw filled square
        reviewCtx.beginPath();
        reviewCtx.rect(mappedX - size, mappedY - size, size * 2, size * 2);
        reviewCtx.fillStyle = '#581c87'; // Deep purple color
        reviewCtx.fill();
        
        // Draw white dot in center
        reviewCtx.beginPath();
        reviewCtx.arc(mappedX, mappedY, 3, 0, Math.PI * 2);
        reviewCtx.fillStyle = 'white';
        reviewCtx.fill();
    } else if (markerType === 'foulCommittedTechnical') {
        // Draw deep purple filled square
        const mappedX = mapXReview(x);
        const mappedY = mapYReview(y);
        const size = 6;
        
        reviewCtx.beginPath();
        reviewCtx.rect(mappedX - size, mappedY - size, size * 2, size * 2);
        reviewCtx.fillStyle = '#581c87'; // Deep purple color
        reviewCtx.fill();
    }
    reviewMarkers.push({ x, y, entry, color, markerType });
};

const drawHandpassMarker = (x1, y1, x2, y2, color, entry) => {
    const mappedX1 = mapXReview(x1);
    const mappedY1 = mapYReview(y1);
    const mappedX2 = mapXReview(x2);
    const mappedY2 = mapYReview(y2);
    
    // Calculate angle for arrow direction
    const angle = Math.atan2(mappedY2 - mappedY1, mappedX2 - mappedX1);
    
    // Draw dotted line between start and end points
    reviewCtx.beginPath();
    reviewCtx.setLineDash([5, 5]); // Create dotted line pattern
    reviewCtx.moveTo(mappedX1, mappedY1);
    reviewCtx.lineTo(mappedX2, mappedY2);
    reviewCtx.strokeStyle = color;
    reviewCtx.lineWidth = 3;
    reviewCtx.stroke();
    reviewCtx.setLineDash([]); // Reset line dash pattern
    
    // Draw start point (larger filled circle)
    reviewCtx.beginPath();
    reviewCtx.arc(mappedX1, mappedY1, 4, 0, Math.PI * 2);
    reviewCtx.fillStyle = color;
    reviewCtx.fill();
    
    // Draw end point (larger filled circle)
    reviewCtx.beginPath();
    reviewCtx.arc(mappedX2, mappedY2, 4, 0, Math.PI * 2);
    reviewCtx.fillStyle = color;
    reviewCtx.fill();
    
    // Draw arrow just before the end point circle
    const arrowLength = 6;
    const arrowAngle = Math.PI / 6; // 30 degrees
    const circleRadius = 4;
    
    // Calculate arrow start point (just before the circle)
    const arrowStartX = mappedX2 - (circleRadius + 2) * Math.cos(angle);
    const arrowStartY = mappedY2 - (circleRadius + 2) * Math.sin(angle);
    
    reviewCtx.beginPath();
    reviewCtx.moveTo(arrowStartX, arrowStartY);
    reviewCtx.lineTo(
        arrowStartX - arrowLength * Math.cos(angle - arrowAngle),
        arrowStartY - arrowLength * Math.sin(angle - arrowAngle)
    );
    reviewCtx.moveTo(arrowStartX, arrowStartY);
    reviewCtx.lineTo(
        arrowStartX - arrowLength * Math.cos(angle + arrowAngle),
        arrowStartY - arrowLength * Math.sin(angle + arrowAngle)
    );
    reviewCtx.strokeStyle = color;
    reviewCtx.lineWidth = 3;
    reviewCtx.stroke();
    
    // Reset line width to default
    reviewCtx.lineWidth = 1;
    
    // Add markers for interaction
    reviewMarkers.push({ x: x1, y: y1, entry, color, markerType: 'handpass-start' });
    reviewMarkers.push({ x: x2, y: y2, entry, color, markerType: 'handpass-end' });
};

const drawKickpassMarker = (x1, y1, x2, y2, color, entry) => {
    const mappedX1 = mapXReview(x1);
    const mappedY1 = mapYReview(y1);
    const mappedX2 = mapXReview(x2);
    const mappedY2 = mapYReview(y2);
    
    // Calculate angle for arrow direction
    const angle = Math.atan2(mappedY2 - mappedY1, mappedX2 - mappedX1);
    
    // Draw solid line between start and end points
    reviewCtx.beginPath();
    reviewCtx.moveTo(mappedX1, mappedY1);
    reviewCtx.lineTo(mappedX2, mappedY2);
    reviewCtx.strokeStyle = color;
    reviewCtx.lineWidth = 3;
    reviewCtx.stroke();
    
    // Draw start point (filled circle)
    reviewCtx.beginPath();
    reviewCtx.arc(mappedX1, mappedY1, 4, 0, Math.PI * 2);
    reviewCtx.fillStyle = color;
    reviewCtx.fill();
    
    // Draw end point (filled circle)
    reviewCtx.beginPath();
    reviewCtx.arc(mappedX2, mappedY2, 4, 0, Math.PI * 2);
    reviewCtx.fillStyle = color;
    reviewCtx.fill();
    
    // Draw arrow just before the end point circle
    const arrowLength = 6;
    const arrowAngle = Math.PI / 6; // 30 degrees
    const circleRadius = 4;
    
    // Calculate arrow start point (just before the circle)
    const arrowStartX = mappedX2 - (circleRadius + 2) * Math.cos(angle);
    const arrowStartY = mappedY2 - (circleRadius + 2) * Math.sin(angle);
    
    reviewCtx.beginPath();
    reviewCtx.moveTo(arrowStartX, arrowStartY);
    reviewCtx.lineTo(
        arrowStartX - arrowLength * Math.cos(angle - arrowAngle),
        arrowStartY - arrowLength * Math.sin(angle - arrowAngle)
    );
    reviewCtx.moveTo(arrowStartX, arrowStartY);
    reviewCtx.lineTo(
        arrowStartX - arrowLength * Math.cos(angle + arrowAngle),
        arrowStartY - arrowLength * Math.sin(angle + arrowAngle)
    );
    reviewCtx.strokeStyle = color;
    reviewCtx.lineWidth = 3;
    reviewCtx.stroke();
    
    // Reset line width to default
    reviewCtx.lineWidth = 1;
    
    // Add markers for interaction
    reviewMarkers.push({ x: x1, y: y1, entry, color, markerType: 'kickpass-start' });
    reviewMarkers.push({ x: x2, y: y2, entry, color, markerType: 'kickpass-end' });
};

const drawCarryMarker = (x1, y1, x2, y2, color, entry) => {
    const mappedX1 = mapXReview(x1);
    const mappedY1 = mapYReview(y1);
    const mappedX2 = mapXReview(x2);
    const mappedY2 = mapYReview(y2);
    
    // Calculate angle for arrow direction
    const angle = Math.atan2(mappedY2 - mappedY1, mappedX2 - mappedX1);
    
    // Draw solid line between start and end points
    reviewCtx.beginPath();
    reviewCtx.moveTo(mappedX1, mappedY1);
    reviewCtx.lineTo(mappedX2, mappedY2);
    reviewCtx.strokeStyle = color;
    reviewCtx.lineWidth = 3;
    reviewCtx.stroke();
    
    // Draw start point (filled circle)
    reviewCtx.beginPath();
    reviewCtx.arc(mappedX1, mappedY1, 4, 0, Math.PI * 2);
    reviewCtx.fillStyle = color;
    reviewCtx.fill();
    
    // Draw end point (filled circle)
    reviewCtx.beginPath();
    reviewCtx.arc(mappedX2, mappedY2, 4, 0, Math.PI * 2);
    reviewCtx.fillStyle = color;
    reviewCtx.fill();
    
    // Draw arrow just before the end point circle
    const arrowLength = 6;
    const arrowAngle = Math.PI / 6; // 30 degrees
    const circleRadius = 4;
    
    // Calculate arrow start point (just before the circle)
    const arrowStartX = mappedX2 - (circleRadius + 2) * Math.cos(angle);
    const arrowStartY = mappedY2 - (circleRadius + 2) * Math.sin(angle);
    
    reviewCtx.beginPath();
    reviewCtx.moveTo(arrowStartX, arrowStartY);
    reviewCtx.lineTo(
        arrowStartX - arrowLength * Math.cos(angle - arrowAngle),
        arrowStartY - arrowLength * Math.sin(angle - arrowAngle)
    );
    reviewCtx.moveTo(arrowStartX, arrowStartY);
    reviewCtx.lineTo(
        arrowStartX - arrowLength * Math.cos(angle + arrowAngle),
        arrowStartY - arrowLength * Math.sin(angle + arrowAngle)
    );
    reviewCtx.strokeStyle = color;
    reviewCtx.lineWidth = 3;
    reviewCtx.stroke();
    
    // Reset line width to default
    reviewCtx.lineWidth = 1;
    
    // Add markers for interaction
    reviewMarkers.push({ x: x1, y: y1, entry, color, markerType: 'carry-start' });
    reviewMarkers.push({ x: x2, y: y2, entry, color, markerType: 'carry-end' });
};

const filterActions = () => {
    // Check Point-Score filter toggles
    const showPointScoreTeam1 = document.getElementById('filter-point-score-team1')?.checked || false;
    const showPointScoreTeam2 = document.getElementById('filter-point-score-team2')?.checked || false;
    
    // Check 2-Point-Score filter toggles
    const show2PointScoreTeam1 = document.getElementById('filter-2-point-score-team1')?.checked || false;
    const show2PointScoreTeam2 = document.getElementById('filter-2-point-score-team2')?.checked || false;
    
    // Check Goal-Score filter toggles
    const showGoalScoreTeam1 = document.getElementById('filter-goal-score-team1')?.checked || false;
    const showGoalScoreTeam2 = document.getElementById('filter-goal-score-team2')?.checked || false;
    
    // Check Point-Miss filter toggles
    const showPointMissTeam1 = document.getElementById('filter-point-miss-team1')?.checked || false;
    const showPointMissTeam2 = document.getElementById('filter-point-miss-team2')?.checked || false;
    
    // Check Goal-Miss filter toggles
    const showGoalMissTeam1 = document.getElementById('filter-goal-miss-team1')?.checked || false;
    const showGoalMissTeam2 = document.getElementById('filter-goal-miss-team2')?.checked || false;
    
    // Check Kickout filter toggles
    const showKickoutTeam1 = document.getElementById('filter-kickout-team1')?.checked || false;
    const showKickoutTeam2 = document.getElementById('filter-kickout-team2')?.checked || false;
    
    // Check Free Won filter toggles
    const showFreeWonTeam1 = document.getElementById('filter-free-won-team1')?.checked || false;
    const showFreeWonTeam2 = document.getElementById('filter-free-won-team2')?.checked || false;
    
    // Check Ball Lost (Forced) filter toggles
    const showBallLostForcedTeam1 = document.getElementById('filter-ball-lost-forced-team1')?.checked || false;
    const showBallLostForcedTeam2 = document.getElementById('filter-ball-lost-forced-team2')?.checked || false;
    
    // Check Ball Lost (Unforced) filter toggles
    const showBallLostUnforcedTeam1 = document.getElementById('filter-ball-lost-unforced-team1')?.checked || false;
    const showBallLostUnforcedTeam2 = document.getElementById('filter-ball-lost-unforced-team2')?.checked || false;
    
    // Check Handpass filter toggles
    const showHandpassTeam1 = document.getElementById('filter-handpass-team1')?.checked || false;
    const showHandpassTeam2 = document.getElementById('filter-handpass-team2')?.checked || false;
    
    // Check Kickpass filter toggles
    const showKickpassTeam1 = document.getElementById('filter-kickpass-team1')?.checked || false;
    const showKickpassTeam2 = document.getElementById('filter-kickpass-team2')?.checked || false;
    
    // Check Carry filter toggles
    const showCarryTeam1 = document.getElementById('filter-carry-team1')?.checked || false;
    const showCarryTeam2 = document.getElementById('filter-carry-team2')?.checked || false;
    
    // Check Ball Won (Forced) filter toggles
    const showBallWonForcedTeam1 = document.getElementById('filter-ball-won-forced-team1')?.checked || false;
    const showBallWonForcedTeam2 = document.getElementById('filter-ball-won-forced-team2')?.checked || false;
    
    // Check Ball Won (Unforced) filter toggles
    const showBallWonUnforcedTeam1 = document.getElementById('filter-ball-won-unforced-team1')?.checked || false;
    const showBallWonUnforcedTeam2 = document.getElementById('filter-ball-won-unforced-team2')?.checked || false;
    
    // Check Foul Committed filter toggles
    const showFoulCommittedTeam1 = document.getElementById('filter-foul-committed-team1')?.checked || false;
    const showFoulCommittedTeam2 = document.getElementById('filter-foul-committed-team2')?.checked || false;
    
    // Temporary: Show all other actions until new filter system is implemented
    const showOwnShots = true;
    const showFoulsWon = true;
    const showHandpasses = true;
    const showKickpasses = true;
    const showCarries = true;
    const showUnforcedErrors = true;
    const showForcedErrors = true;
    const showOwnKickouts = true;
    const showOppKickouts = true;
    const showPointAgainst = true;
    const showGoalAgainst = true;
    const showMissAgainst = true;
    const showTurnovers = true;

    // Clear the pitch and remove any existing markers
    drawReviewPitch();
    reviewMarkers = []; // Clear existing markers

    // Iterate over actionsLog and display markers based on toggle states
    actionsLog.forEach(entry => {
        const [x1, y1] = entry.coordinates1.slice(1, -1).split(', ').map(Number);
        const [x2, y2] = entry.coordinates2 ? entry.coordinates2.slice(1, -1).split(', ').map(Number) : [];

        if (showOwnShots) {
            if (entry.action === 'Point - Score') {
                // Check team filter for Point - Score
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showPointScoreTeam1) || (!isTeam1 && showPointScoreTeam2);
                
                if (shouldShow) {
                    // Get team colors for styling
                    const team1Primary = getComputedStyle(document.documentElement).getPropertyValue('--team1-primary').trim() || '#3b82f6';
                    const team2Primary = getComputedStyle(document.documentElement).getPropertyValue('--team2-primary').trim() || '#ef4444';
                    const teamColor = isTeam1 ? team1Primary : team2Primary;
                    
                    // Use the existing drawReviewMarker function with team-specific color
                    drawReviewMarker(x1, y1, teamColor, entry, 'Point - Score', 'pointScore');
                }
            } else if (entry.action === '2-Point - Score') {
                // Check team filter for 2-Point - Score
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && show2PointScoreTeam1) || (!isTeam1 && show2PointScoreTeam2);
                
                if (shouldShow) {
                    drawReviewMarker(x1, y1, '#065f46', entry, '2-Point - Score', 'twoPointScore');
                }
            } else if (entry.action === 'Point - Miss') {
                // Check team filter for Point - Miss
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showPointMissTeam1) || (!isTeam1 && showPointMissTeam2);
                
                if (shouldShow) {
                    drawReviewMarker(x1, y1, '#dc2626', entry, 'Point - Miss', 'pointMiss');
                }
            } else if (entry.action === 'Goal - Score') {
                // Check team filter for Goal - Score
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showGoalScoreTeam1) || (!isTeam1 && showGoalScoreTeam2);
                
                if (shouldShow) {
                    drawReviewMarker(x1, y1, '#065f46', entry, 'Goal - Score', 'goalScore');
                }
            } else if (entry.action === 'Goal - Miss') {
                // Check team filter for Goal - Miss
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showGoalMissTeam1) || (!isTeam1 && showGoalMissTeam2);
                
                if (shouldShow) {
                    drawReviewMarker(x1, y1, '#dc2626', entry, 'Goal - Miss', 'goalMiss');
                }
            } else if (entry.action === 'Our Kickout' && showKickoutTeam1) {
                // Plot Team 1 Kickout actions (white diamonds)
                // Determine icon type based on Screen 1 (mode) and Screen 2 (definition)
                let markerType = 'kickout';
                
                // Check if contested (has black dot)
                const isContested = entry.definition === 'Contested';
                
                // Check if won (filled) or lost (hollow)
                const isWon = entry.mode === 'Won Clean' || entry.mode === 'Won Break' || entry.mode === 'Won Sideline' || entry.mode === 'Won Foul';
                
                // Determine marker type
                if (isWon && !isContested) {
                    markerType = 'kickoutWonUncontested';
                } else if (isWon && isContested) {
                    markerType = 'kickoutWonContested';
                } else if (!isWon && !isContested) {
                    markerType = 'kickoutLostUncontested';
                } else if (!isWon && isContested) {
                    markerType = 'kickoutLostContested';
                }
                
                drawReviewMarker(x1, y1, 'white', entry, 'Kickout', markerType);
            } else if (entry.action === 'Opp. Kickout' && showKickoutTeam2) {
                // Plot Team 2 Kickout actions (black diamonds)
                // Determine icon type based on Screen 1 (mode) and Screen 2 (definition)
                let markerType = 'kickout';
                
                // Check if contested (has white dot)
                const isContested = entry.definition === 'Contested';
                
                // Check if won (filled) or lost (hollow)
                const isWon = entry.mode === 'Won Clean' || entry.mode === 'Won Break' || entry.mode === 'Won Sideline' || entry.mode === 'Won Foul';
                
                // Determine marker type for Team 2 (black diamonds)
                if (isWon && !isContested) {
                    markerType = 'kickoutTeam2WonUncontested';
                } else if (isWon && isContested) {
                    markerType = 'kickoutTeam2WonContested';
                } else if (!isWon && !isContested) {
                    markerType = 'kickoutTeam2LostUncontested';
                } else if (!isWon && isContested) {
                    markerType = 'kickoutTeam2LostContested';
                }
                
                drawReviewMarker(x1, y1, 'black', entry, 'Kickout', markerType);
            } else if (entry.action === 'Free Won') {
                // Plot Free Won actions (turquoise rounded hexagon)
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showFreeWonTeam1) || (!isTeam1 && showFreeWonTeam2);
                
                if (shouldShow) {
                    drawReviewMarker(x1, y1, '#14b8a6', entry, 'Free Won', 'freeWon');
                }
            } else if (entry.action === 'Ball Lost (Forced)') {
                // Plot Ball Lost (Forced) actions (red-orange downward triangle)
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showBallLostForcedTeam1) || (!isTeam1 && showBallLostForcedTeam2);
                
                if (shouldShow) {
                    drawReviewMarker(x1, y1, '#ea580c', entry, 'Ball Lost (Forced)', 'ballLostForced');
                }
            } else if (entry.action === 'Ball Lost (Unforced)') {
                // Plot Ball Lost (Unforced) actions (red-orange hollow triangle)
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showBallLostUnforcedTeam1) || (!isTeam1 && showBallLostUnforcedTeam2);
                
                if (shouldShow) {
                    drawReviewMarker(x1, y1, '#ea580c', entry, 'Ball Lost (Unforced)', 'ballLostUnforced');
                }
            } else if (entry.action === 'Handpass') {
                // Plot Handpass actions (vibrant yellow circles connected by dotted line)
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showHandpassTeam1) || (!isTeam1 && showHandpassTeam2);
                
                if (shouldShow) {
                    // Draw handpass with start/end points and dotted line
                    drawHandpassMarker(x1, y1, x2, y2, '#fde047', entry);
                }
            } else if (entry.action === 'Kickpass') {
                // Plot Kickpass actions (navy circles connected by solid line with arrow)
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showKickpassTeam1) || (!isTeam1 && showKickpassTeam2);
                
                if (shouldShow) {
                    // Draw kickpass with start/end points and solid line
                    drawKickpassMarker(x1, y1, x2, y2, '#1e3a8a', entry);
                }
            } else if (entry.action === 'Carry') {
                // Plot Carry actions (dark grey circles connected by solid line with arrow)
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showCarryTeam1) || (!isTeam1 && showCarryTeam2);
                
                if (shouldShow) {
                    // Draw carry with start/end points and solid line
                    drawCarryMarker(x1, y1, x2, y2, '#374151', entry);
                }
            } else if (entry.action === 'Ball Won (Forced)') {
                // Plot Ball Won (Forced) actions (royal blue filled triangle)
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showBallWonForcedTeam1) || (!isTeam1 && showBallWonForcedTeam2);
                
                if (shouldShow) {
                    drawReviewMarker(x1, y1, '#1e40af', entry, 'Ball Won (Forced)', 'ballWonForced');
                }
            } else if (entry.action === 'Ball Won (Unforced)') {
                // Plot Ball Won (Unforced) actions (royal blue hollow triangle)
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showBallWonUnforcedTeam1) || (!isTeam1 && showBallWonUnforcedTeam2);
                
                if (shouldShow) {
                    drawReviewMarker(x1, y1, '#1e40af', entry, 'Ball Won (Unforced)', 'ballWonUnforced');
                }
            } else if (entry.action === 'Foul Committed') {
                // Plot Foul Committed actions (conditional deep purple squares)
                const teamCode = getTeamFromAction(entry);
                const isTeam1 = teamCode === 'team1';
                const shouldShow = (isTeam1 && showFoulCommittedTeam1) || (!isTeam1 && showFoulCommittedTeam2);
                
                if (shouldShow) {
                    // Determine marker type based on Screen 1 (mode)
                    let markerType = 'foulCommitted';
                    
                    // Check if Physical (has white exclamation point)
                    const isPhysical = entry.mode === 'Physical';
                    
                    // Determine marker type
                    if (isPhysical) {
                        markerType = 'foulCommittedPhysical';
                    } else {
                        markerType = 'foulCommittedTechnical';
                    }
                    
                    drawReviewMarker(x1, y1, '#581c87', entry, 'Foul Committed', markerType);
                }
            }
        }





        if (showUnforcedErrors && entry.action === 'Ball - Lost' && entry.mode === 'Unforced Error') {
            drawReviewMarker(x1, y1, 'brown', entry, 'Ball - Lost', 'hollowCircle');
        }

        if (showForcedErrors && entry.action === 'Ball - Lost' && entry.mode === 'Forced Error') {
            drawReviewMarker(x1, y1, 'brown', entry, 'Ball - Lost', 'square');
        }

        if (showTurnovers && entry.action === 'Ball - Won') {
            let color = 'gold';
            let markerType = 'square';

            if (['Unforced'].includes(entry.mode)) {
                color = 'gold';
                markerType = 'circle';
            }

            drawReviewMarker(x1, y1, color, entry, 'Ball - Won', markerType);
        }


        if (showOppKickouts && entry.action === 'Kickout - Against') {
            let color = 'black';
            let markerType = 'cross';

            if (['Won Clean', 'Won Break', 'Won Sideline', 'Won Foul'].includes(entry.mode)) {
                markerType = 'circle';

                if (entry.definition === 'Not Contested') {
                    markerType = 'square';
                }
            }

            drawReviewMarker(x1, y1, color, entry, 'Kickout - Against', markerType);
        }

        if (showPointAgainst && entry.action === 'Point - Against') {
            drawReviewMarker(x1, y1, 'blue', entry, 'Point - Against', 'hollowCircle');
        }

        if (showPointAgainst && entry.action === '2-Point - Against') {
            drawReviewMarker(x1, y1, 'blue', entry, '2-Point - Against', 'hollowCircle');
        }

        if (showGoalAgainst && entry.action === 'Goal - Against') {
            drawReviewMarker(x1, y1, 'green', entry, 'Goal - Against', 'hollowCircle');
        }

        if (showMissAgainst && entry.action === 'Miss - Against') {
            drawReviewMarker(x1, y1, 'red', entry, 'Goal - Against', 'cross');
        }
    });
};

const handleCanvasClick = (e) => {
    const rect = reviewCanvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / reviewCanvas.width) * 80;
    const clickY = 140 - ((e.clientY - rect.top) / reviewCanvas.height) * 140;

    let clickedMarker = null;

    reviewMarkers.forEach(marker => {
        const { x, y, entry, color } = marker;
        if (Math.abs(clickX - x) < 2 && Math.abs(clickY - y) < 2) {
            clickedMarker = { x, y, entry, color };
        }
    });

    // Remove any existing summary box
    const existingSummaryBox = document.getElementById('summary-box');
    if (existingSummaryBox) {
        existingSummaryBox.remove();
    }

    if (clickedMarker) {
        showSummaryBox(e.clientX, e.clientY, clickedMarker.entry, clickedMarker.color);
        e.stopPropagation(); // Prevent click event from propagating
    }

};

function showSummaryBox(x, y, entry, color) {
    // Remove any existing summary box first
    const existingBox = document.getElementById('summary-box');
    if (existingBox) {
        existingBox.remove();
    }
    
    const summaryBox = document.createElement('div');
    summaryBox.id = 'summary-box';
    summaryBox.style.position = 'absolute';
    summaryBox.style.visibility = 'hidden'; // Hide initially to prevent jumping
    summaryBox.style.zIndex = '10000';
    
    // Add to DOM first to get dimensions
    document.body.appendChild(summaryBox);
    
    // Position adjustment to prevent going off-screen
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    let adjustedX = x + scrollLeft + 10; // Small offset from click point
    let adjustedY = y + scrollTop + 10;
    
    // Get actual dimensions after adding to DOM
    const boxRect = summaryBox.getBoundingClientRect();
    const boxWidth = boxRect.width || 280; // fallback width
    const boxHeight = boxRect.height || 200; // fallback height
    
    // Adjust if would go off screen
    if (adjustedX + boxWidth > window.innerWidth + scrollLeft) {
        adjustedX = x + scrollLeft - boxWidth - 10;
    }
    if (adjustedY + boxHeight > window.innerHeight + scrollTop) {
        adjustedY = y + scrollTop - boxHeight - 10;
    }
    
    // Ensure minimum margins
    adjustedX = Math.max(scrollLeft + 10, adjustedX);
    adjustedY = Math.max(scrollTop + 10, adjustedY);
    
    summaryBox.style.left = `${adjustedX}px`;
    summaryBox.style.top = `${adjustedY}px`;
    summaryBox.style.visibility = 'visible'; // Show after positioning
    
    // Add a subtle accent border using the action color
    summaryBox.style.borderLeft = `4px solid ${color}`;

    const [coordX1, coordY1] = entry.coordinates1.slice(1, -1).split(', ');
    const [coordX2, coordY2] = entry.coordinates2 ? entry.coordinates2.slice(1, -1).split(', ') : [];
    const distance = coordX2 && coordY2 ? calculateDistance(coordX1, coordY1, coordX2, coordY2) : '';

    // Generate content using streamlined approach
    const actionConfigs = {
        'Point - Score': {
            title: 'Point - Score',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.player }
            ]
        },
        '2-Point - Score': {
            title: '2-Point - Score',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.player }
            ]
        },
        'Point - Miss': {
            title: 'Point - Miss',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.definition },
                { label: '', value: entry.player }
            ]
        },
        '45 Entry': {
            title: '45 Entry',
            fields: entry.player2 ? [
                { label: 'Player 1', value: entry.player },
                { label: 'Player 2', value: entry.player2 },
                { label: 'Type', value: entry.mode }
            ] : [
                { label: 'Player', value: entry.player },
                { label: 'Type', value: entry.mode }
            ]
        },
        'Source of Shot': {
            title: 'Source of Shot',
            fields: [
                { label: 'Type', value: entry.mode }
            ]
        },
        'Goal - Score': {
            title: 'Goal - Score',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.player }
            ]
        },
        'Goal - Miss': {
            title: 'Goal - Miss',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.definition },
                { label: '', value: entry.player }
            ]
        },
        'Kickout': {
            title: 'Kickout',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.definition },
                { label: '', value: entry.player }
            ]
        },
        'Free Won': {
            title: 'Free Won',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.player }
            ]
        },
        'Ball Lost (Forced)': {
            title: 'Ball Lost (Forced)',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.player }
            ]
        },
        'Ball Lost (Unforced)': {
            title: 'Ball Lost (Unforced)',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.player }
            ]
        },
        'Ball Won (Forced)': {
            title: 'Ball Won (Forced)',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.player }
            ]
        },
        'Ball Won (Unforced)': {
            title: 'Ball Won (Unforced)',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.player }
            ]
        },
        'Foul Committed': {
            title: 'Foul Committed',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.definition },
                { label: '', value: entry.player }
            ]
        },
        'Handpass': {
            title: 'Handpass',
            fields: [
                { label: '', value: `From: ${entry.player}` },
                { label: '', value: `To: ${entry.player2}` },
                { label: '', value: `Dist = ${distance}m` }
            ]
        },
        'Kickpass': {
            title: 'Kickpass',
            fields: [
                { label: '', value: `From: ${entry.player}` },
                { label: '', value: `To: ${entry.player2}` },
                { label: '', value: `Dist = ${distance}m` }
            ]
        },
        'Carry': {
            title: 'Carry',
            fields: [
                { label: '', value: entry.mode },
                { label: '', value: entry.player },
                { label: '', value: `Dist = ${distance}m` }
            ]
        },
        'Ball - Lost': {
            title: 'Ball - Lost',
            fields: [
                { label: 'Type', value: entry.mode === 'Unforced Error' ? 'Unforced' : 'Forced' },
                { label: 'How', value: entry.definition },
                { label: 'Player', value: entry.player }
            ]
        },
        'Ball - Won': {
            title: 'Ball - Won',
            fields: [
                { label: 'Type', value: entry.mode },
                { label: 'How', value: entry.definition },
                { label: 'Player', value: entry.player }
            ]
        },
        'Our Kickout': {
            title: 'Our Kickout',
            fields: [
                { label: 'Won/Lost', value: entry.mode },
                { label: 'Contest', value: entry.definition },
                { label: 'Pass To', value: entry.player }
            ]
        },
        'Opp. Kickout': {
            title: 'Opp. Kickout',
            fields: [
                { label: 'Won/Lost', value: entry.mode },
                { label: 'Contest', value: entry.definition },
                { label: 'Pass To', value: entry.player }
            ]
        },
        'Kickout - Against': {
            title: 'Opp. Kickout',
            fields: [
                { label: 'Won/Lost', value: entry.mode },
                { label: 'Contest', value: entry.definition },
                { label: 'Pass To', value: entry.player }
            ]
        },
        'Point - Against': {
            title: 'Point Against',
            fields: [
                { label: 'Type', value: entry.mode },
                { label: 'Player', value: entry.player }
            ]
        },
        '2-Point - Against': {
            title: '2-Point Against',
            fields: [
                { label: 'Type', value: entry.definition },
                { label: 'Player', value: entry.player }
            ]
        },
        'Goal - Against': {
            title: 'Goal Against',
            fields: [
                { label: 'Type', value: entry.mode },
                { label: 'Player', value: entry.player }
            ]
        },
        'Miss - Against': {
            title: 'Miss Against',
            fields: [
                { label: 'Type', value: entry.mode },
                { label: 'How', value: entry.definition }
            ]
        }
    };

    // Generate content based on action type
    const config = actionConfigs[entry.action] || { title: entry.action, fields: [] };
    
    let content;
    
    // Special handling for Point - Score, 2-Point - Score, Goal - Score, Point - Miss, Goal - Miss, Kickout, Free Won, Ball Lost (Forced), Ball Lost (Unforced), Ball Won (Forced), Ball Won (Unforced), Foul Committed, Handpass, Kickpass, and Carry
    if (entry.action === 'Point - Score' || entry.action === '2-Point - Score' || entry.action === 'Goal - Score' || entry.action === 'Point - Miss' || entry.action === 'Goal - Miss' || entry.action === 'Our Kickout' || entry.action === 'Opp. Kickout' || entry.action === 'Free Won' || entry.action === 'Ball Lost (Forced)' || entry.action === 'Ball Lost (Unforced)' || entry.action === 'Ball Won (Forced)' || entry.action === 'Ball Won (Unforced)' || entry.action === 'Foul Committed' || entry.action === 'Handpass' || entry.action === 'Kickpass' || entry.action === 'Carry') {
        // Use 'Kickout' as title for both Our Kickout and Opp. Kickout
        const displayTitle = (entry.action === 'Our Kickout' || entry.action === 'Opp. Kickout') ? 'Kickout' : config.title;
        content = `<p><strong>${displayTitle}</strong></p>`;
        config.fields.forEach(field => {
            if (field.value) {
                content += `<p><strong>${field.value}</strong></p>`;
            }
        });
        
        // Add note with separator if it exists
        if (entry.notes && entry.notes.length > 0 && entry.notes[0].trim() !== '') {
            content += `<hr style="margin: 10px 0; border: none; border-top: 1px solid rgba(0,0,0,0.2);">`;
            content += `<p style="word-wrap: break-word; white-space: normal;"><strong>${entry.notes[0]}</strong></p>`;
        }
    } else {
        content = `<p><strong>Action:</strong> ${config.title}</p>`;
    // Add fields
    config.fields.forEach(field => {
        if (field.value) {
            content += `<p><strong>${field.label}:</strong> ${field.value}</p>`;
        }
    });
    }
    
    // Add coordinates (skip for Point - Score, 2-Point - Score, Goal - Score, Point - Miss, and Goal - Miss)
    if (entry.action !== 'Point - Score' && entry.action !== '2-Point - Score' && entry.action !== 'Goal - Score' && entry.action !== 'Point - Miss' && entry.action !== 'Goal - Miss' && entry.action !== 'Our Kickout' && entry.action !== 'Opp. Kickout' && entry.action !== 'Free Won' && entry.action !== 'Ball Lost (Forced)' && entry.action !== 'Ball Lost (Unforced)' && entry.action !== 'Ball Won (Forced)' && entry.action !== 'Ball Won (Unforced)' && entry.action !== 'Foul Committed' && entry.action !== 'Handpass' && entry.action !== 'Kickpass' && entry.action !== 'Carry') {
    if (config.coords === 'both') {
        content += `<p style="font-size: small; margin-top: 10px;"><strong>Coords_1:</strong> (${coordX1}, ${coordY1})</p>`;
        content += `<p style="font-size: small; margin-top: 10px;"><strong>Coords_2:</strong> (${coordX2}, ${coordY2})</p>`;
    } else {
        content += `<p style="font-size: small; margin-top: 10px;"><strong>Coords:</strong> (${coordX1}, ${coordY1})</p>`;
        }
    }
    
    summaryBox.innerHTML = content;

    // Remove any existing event listener to prevent duplication
    document.removeEventListener('click', handleDocumentClick);

    function handleDocumentClick(event) {
        const isClickInsideSummaryBox = summaryBox.contains(event.target);
        if (!isClickInsideSummaryBox) {
            summaryBox.remove();
            document.removeEventListener('click', handleDocumentClick);
        }
    }

    // Add event listener with a small delay to prevent immediate closure
    setTimeout(() => {
    document.addEventListener('click', handleDocumentClick);
    }, 100);
}

const drawPassMarkersAndArrow = (x1, y1, x2, y2, color, entry, actionType) => {
    // Draw the start marker
    drawReviewMarker(x1, y1, color, entry, `${actionType} Start`);

    // Draw the end marker
    drawReviewMarker(x2, y2, color, entry, `${actionType} End`);

    // Draw the arrow connecting the two markers
    reviewCtx.beginPath();
    reviewCtx.moveTo(mapXReview(x1), mapYReview(y1));
    reviewCtx.lineTo(mapXReview(x2), mapYReview(y2));
    reviewCtx.strokeStyle = color;
    reviewCtx.stroke();

    // Draw the filled arrowhead
    const headlen = 15; // length of head in pixels
    const angle = Math.atan2(mapYReview(y2) - mapYReview(y1), mapX(x2) - mapX(x1));
    reviewCtx.beginPath();
    reviewCtx.moveTo(mapXReview(x2), mapYReview(y2));
    reviewCtx.lineTo(mapXReview(x2) - headlen * Math.cos(angle - Math.PI / 6), mapYReview(y2) - headlen * Math.sin(angle - Math.PI / 6));
    reviewCtx.lineTo(mapXReview(x2) - headlen * Math.cos(angle + Math.PI / 6), mapYReview(y2) - headlen * Math.sin(angle + Math.PI / 6));
    reviewCtx.lineTo(mapXReview(x2), mapYReview(y2));
    reviewCtx.fillStyle = color;
    reviewCtx.fill();
};

reviewCanvas.addEventListener('click', handleCanvasClick);

// Event listeners for toggles - REMOVED (old filter structure no longer exists)
// New filter system will be implemented later

// Call filterActions on load to ensure markers are managed based on initial state
filterActions();

const refreshReviewTab = () => {
    filterActions();
};

const calculateDistance = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy).toFixed(2);
};

// Allowing dynamic changes to player names
let editingPlayerId = null;

function openEditPopup(playerIndex) {
    editingPlayerIndex = playerIndex;
    
    // Determine if this is an opposition player
    const isOpposition = playerIndex > 100;
    const playerData = isOpposition ? oppositionPlayerNames[playerIndex] : playerNames[playerIndex];
    
    const [number, ...nameParts] = playerData.split(' - ');
    document.getElementById('player-number-input').value = number.replace('#', '');
    document.getElementById('player-name-input').value = nameParts.join(' ').trim();
    const popup = document.getElementById('player-edit-popup');
    PopupAnimator.showPopup(popup, 'standard');
}

function confirmPlayerEdit() {
    const number = document.getElementById('player-number-input').value.trim();
    const name = document.getElementById('player-name-input').value.trim();

    if (!number || !name) {
        alert('Please enter both number and name.');
        return;
    }

    const formattedName = `#${number} - ${name}`;
    
    // Determine if this is an opposition player
    const isOpposition = editingPlayerIndex > 100;
    
    if (isOpposition) {
        oppositionPlayerNames[editingPlayerIndex] = formattedName;
        // Update opposition button
        const targetBtn = document.getElementById(`opp-player-${editingPlayerIndex - 100}-button`);
        if (targetBtn) targetBtn.textContent = formattedName;
    } else {
        playerNames[editingPlayerIndex] = formattedName;
        // Update our team button
    const targetBtn = document.getElementById(`player-${editingPlayerIndex}-button`);
    if (targetBtn) targetBtn.textContent = formattedName;
    }

    // Update all player screens
    updatePlayerLabels();

    const popup = document.getElementById('player-edit-popup');
    PopupAnimator.hidePopup(popup, 'standard');
}

document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        const popup = document.getElementById('player-edit-popup');
    PopupAnimator.hidePopup(popup, 'standard');
    }
});

let editingTeamIndex = null;

function openTeamEditPopup(teamIndex) {
    editingTeamIndex = teamIndex;
    const button = document.getElementById(`rename-team-${teamIndex}-button`);
    document.getElementById('team-name-input').value = button.textContent.trim();
    const popup = document.getElementById('team-edit-popup');
    PopupAnimator.showPopup(popup, 'standard');
}

function confirmTeamEdit() {
    const newName = document.getElementById('team-name-input').value.trim();
    if (newName === '') {
        alert('Please enter a valid team name.');
        return;
    }

    // Update home tab button
    document.getElementById(`rename-team-${editingTeamIndex}-button`).textContent = newName;
    
    // Update save button text
    const saveButton = document.getElementById(`save-team-${editingTeamIndex}-button`);
    if (saveButton) {
        const buttonText = saveButton.querySelector('.button-text');
        if (buttonText) {
            buttonText.textContent = `Save Team Sheet`;
        }
    }

    // Update scoreboard label (counter area)
    document.querySelectorAll('.counter-container .team-name')[editingTeamIndex - 1].textContent = `${newName}:`;

    // Update Match Log team names
    updateMatchLogTeamNames();

    // Hide popup
    const popup = document.getElementById('team-edit-popup');
    PopupAnimator.hidePopup(popup, 'standard');
}

document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        const popup = document.getElementById('team-edit-popup');
    PopupAnimator.hidePopup(popup, 'standard');
    }
});

// Enhanced drag and drop with visual feedback
let dragGhost = null;
let currentDragTarget = null;

function addDragAndTouchEventsToPlayerButtons() {
    // Our team players (1-30)
    for (let i = 1; i <= 30; i++) {
        const button = document.getElementById(`player-${i}-button`);
        if (!button) continue;

        // Add draggable styling
        button.classList.add('draggable-element');

        // Desktop drag support
        button.setAttribute('draggable', 'true');
        button.addEventListener('dragstart', handleDragStart);
        button.addEventListener('dragover', handleDragOver);
        button.addEventListener('dragenter', handleDragEnter);
        button.addEventListener('dragleave', handleDragLeave);
        button.addEventListener('drop', handleDrop);
        button.addEventListener('dragend', handleDragEnd);

        // Mobile touch support
        button.addEventListener('touchstart', handleTouchStart, { passive: false });
        button.addEventListener('touchmove', handleTouchMove, { passive: false });
        button.addEventListener('touchend', handleTouchEnd);
    }
    
    // Opposition players (101-130 mapped to opp-player-1 through opp-player-30)
    for (let i = 1; i <= 30; i++) {
        const button = document.getElementById(`opp-player-${i}-button`);
        if (!button) continue;

        // Add draggable styling
        button.classList.add('draggable-element');

        // Desktop drag support
        button.setAttribute('draggable', 'true');
        button.addEventListener('dragstart', handleDragStart);
        button.addEventListener('dragover', handleDragOver);
        button.addEventListener('dragenter', handleDragEnter);
        button.addEventListener('dragleave', handleDragLeave);
        button.addEventListener('drop', handleDrop);
        button.addEventListener('dragend', handleDragEnd);

        // Mobile touch support
        button.addEventListener('touchstart', handleTouchStart, { passive: false });
        button.addEventListener('touchmove', handleTouchMove, { passive: false });
        button.addEventListener('touchend', handleTouchEnd);
    }
}

// --- Enhanced Desktop Drag Events ---
function handleDragStart(e) {
    isDragging = true;
    
    // Determine if this is our team or opposition
    const isOpposition = e.target.id.startsWith('opp-player-');
    if (isOpposition) {
        dragSourceIndex = parseInt(e.target.id.split('-')[2]) + 100; // Convert to 101-130 range
    } else {
        dragSourceIndex = parseInt(e.target.id.split('-')[1]); // Regular 1-30 range
    }
    
    // Create ghost image
    createDragGhost(e.target);
    
    // Style the source element
    e.target.classList.add('drag-source');
    
    // Add dragging cursor to body
    document.body.classList.add('dragging-cursor');
    
    e.dataTransfer.setData('text/plain', dragSourceIndex);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    
    let targetIndex;
    const isOpposition = e.target.id.startsWith('opp-player-');
    if (isOpposition) {
        targetIndex = parseInt(e.target.id.split('-')[2]) + 100; // Convert to 101-130 range
    } else {
        targetIndex = parseInt(e.target.id.split('-')[1]); // Regular 1-27 range
    }
    
    // Only allow swapping within the same team
    const sourceIsOpposition = dragSourceIndex > 100;
    const targetIsOpposition = targetIndex > 100;
    
    if (targetIndex && targetIndex !== dragSourceIndex && sourceIsOpposition === targetIsOpposition) {
        // Remove previous target highlighting
        if (currentDragTarget) {
            currentDragTarget.classList.remove('drag-target-hover');
        }
        
        // Add new target highlighting
        currentDragTarget = e.target;
        e.target.classList.add('drag-target-hover');
    }
}

function handleDragLeave(e) {
    // Only remove highlight if we're actually leaving the element
    if (!e.target.contains(e.relatedTarget)) {
        e.target.classList.remove('drag-target-hover');
        if (currentDragTarget === e.target) {
            currentDragTarget = null;
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    let targetIndex;
    const isOpposition = e.target.id.startsWith('opp-player-');
    if (isOpposition) {
        targetIndex = parseInt(e.target.id.split('-')[2]) + 100; // Convert to 101-130 range
    } else {
        targetIndex = parseInt(e.target.id.split('-')[1]); // Regular 1-27 range
    }
    
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

    // Only allow swapping within the same team
    const sourceIsOpposition = sourceIndex > 100;
    const targetIsOpposition = targetIndex > 100;

    if (sourceIndex !== targetIndex && targetIndex && sourceIsOpposition === targetIsOpposition) {
        swapPlayerNames(sourceIndex, targetIndex);
        
        // Add success animation - get correct button IDs
        let sourceButton, targetButton;
        if (sourceIsOpposition) {
            sourceButton = document.getElementById(`opp-player-${sourceIndex - 100}-button`);
            targetButton = document.getElementById(`opp-player-${targetIndex - 100}-button`);
        } else {
            sourceButton = document.getElementById(`player-${sourceIndex}-button`);
            targetButton = document.getElementById(`player-${targetIndex}-button`);
        }
        
        if (sourceButton) sourceButton.classList.add('swap-success');
        if (targetButton) targetButton.classList.add('swap-success');
        
        // Remove success animation after it completes
        setTimeout(() => {
            if (sourceButton) sourceButton.classList.remove('swap-success');
            if (targetButton) targetButton.classList.remove('swap-success');
        }, 600);
    }
    
    cleanupDragState();
}

function handleDragEnd(e) {
    cleanupDragState();
}

function createDragGhost(element) {
    // Create a visual ghost element
    dragGhost = element.cloneNode(true);
    dragGhost.classList.add('drag-ghost');
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-1000px';
    dragGhost.style.left = '-1000px';
    dragGhost.style.width = element.offsetWidth + 'px';
    dragGhost.style.height = element.offsetHeight + 'px';
    document.body.appendChild(dragGhost);
}

function cleanupDragState() {
    isDragging = false;
    
    // Remove ghost element
    if (dragGhost) {
        document.body.removeChild(dragGhost);
        dragGhost = null;
    }
    
    // Remove all drag-related classes
    document.querySelectorAll('.drag-source, .drag-target-hover').forEach(el => {
        el.classList.remove('drag-source', 'drag-target-hover');
    });
    
    // Remove dragging cursor
    document.body.classList.remove('dragging-cursor');
    
    currentDragTarget = null;
    dragSourceIndex = null;
}

// --- Enhanced Mobile Touch Events ---
let touchDragActive = false;
let touchDragElement = null;

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.id.endsWith('-button') && (element.id.startsWith('player-') || element.id.startsWith('opp-player-'))) {
        // Handle both our team (player-1-button) and opposition (opp-player-1-button) buttons
        if (element.id.startsWith('opp-player-')) {
            touchStartIndex = parseInt(element.id.split('-')[2]) + 100; // Convert to 101-130 range
        } else {
            touchStartIndex = parseInt(element.id.split('-')[1]); // Regular 1-30 range
        }
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        touchDragElement = element;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (!touchDragElement || touchStartIndex === null) return;
    
    const touch = e.touches[0];
    const movedX = Math.abs(touch.clientX - touchStartX);
    const movedY = Math.abs(touch.clientY - touchStartY);
    
    // Start drag mode if moved beyond threshold
    if (!touchDragActive && (movedX > MOVE_THRESHOLD || movedY > MOVE_THRESHOLD)) {
        touchDragActive = true;
        touchDragElement.classList.add('touch-drag-active');
        document.body.classList.add('dragging-cursor');
    }
    
    if (touchDragActive) {
        // Find element under touch point
        const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Remove previous target highlighting
        if (currentDragTarget) {
            currentDragTarget.classList.remove('drag-target-hover');
            currentDragTarget = null;
        }
        
        // Add highlighting to valid drop target
        if (elementUnder && elementUnder.id.startsWith('player-') && elementUnder.id.endsWith('-button')) {
            const targetIndex = parseInt(elementUnder.id.split('-')[1]);
            if (targetIndex && targetIndex !== touchStartIndex) {
                currentDragTarget = elementUnder;
                elementUnder.classList.add('drag-target-hover');
            }
        }
    }
}

function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const touchDuration = Date.now() - touchStartTime;

    const movedX = Math.abs(endX - touchStartX);
    const movedY = Math.abs(endY - touchStartY);

    const element = document.elementFromPoint(endX, endY);
    
    if (touchDragActive) {
        // Handle drag and drop
    if (element && element.id.endsWith('-button') && (element.id.startsWith('player-') || element.id.startsWith('opp-player-'))) {
        // Handle both our team (player-1-button) and opposition (opp-player-1-button) buttons
        let touchEndIndex;
        if (element.id.startsWith('opp-player-')) {
            touchEndIndex = parseInt(element.id.split('-')[2]) + 100; // Convert to 101-130 range
        } else {
            touchEndIndex = parseInt(element.id.split('-')[1]); // Regular 1-30 range
        }

            if (touchStartIndex !== null && touchEndIndex !== null && touchStartIndex !== touchEndIndex) {
                swapPlayerNames(touchStartIndex, touchEndIndex);
                
                // Add success animation - need to get the correct button IDs
                let sourceButton, targetButton;
                if (touchStartIndex > 100) {
                    sourceButton = document.getElementById(`opp-player-${touchStartIndex - 100}-button`);
                } else {
                    sourceButton = document.getElementById(`player-${touchStartIndex}-button`);
                }
                if (touchEndIndex > 100) {
                    targetButton = document.getElementById(`opp-player-${touchEndIndex - 100}-button`);
                } else {
                    targetButton = document.getElementById(`player-${touchEndIndex}-button`);
                }
                
                if (sourceButton) sourceButton.classList.add('swap-success');
                if (targetButton) targetButton.classList.add('swap-success');
                
                setTimeout(() => {
                    if (sourceButton) sourceButton.classList.remove('swap-success');
                    if (targetButton) targetButton.classList.remove('swap-success');
                }, 600);
            }
        }
    } else if (touchDuration < 500 && movedX < MOVE_THRESHOLD && movedY < MOVE_THRESHOLD) {
        // Handle tap (short touch with minimal movement)
        if (element && element.id.endsWith('-button') && (element.id.startsWith('player-') || element.id.startsWith('opp-player-'))) {
            let touchEndIndex;
            if (element.id.startsWith('opp-player-')) {
                touchEndIndex = parseInt(element.id.split('-')[2]) + 100; // Convert to 101-130 range
            } else {
                touchEndIndex = parseInt(element.id.split('-')[1]); // Regular 1-30 range
            }
            openEditPopup(touchEndIndex);
        }
    }

    // Cleanup touch drag state
    cleanupTouchDragState();
}

function cleanupTouchDragState() {
    if (touchDragElement) {
        touchDragElement.classList.remove('touch-drag-active');
    }
    
    if (currentDragTarget) {
        currentDragTarget.classList.remove('drag-target-hover');
    }
    
    document.body.classList.remove('dragging-cursor');
    
    touchDragActive = false;
    touchDragElement = null;
    currentDragTarget = null;
    touchStartIndex = null;
    touchStartX = 0;
    touchStartY = 0;
    touchStartTime = 0;
}

// --- Swap Function ---
function swapPlayerNames(index1, index2) {
    // Determine which team(s) we're working with
    const index1IsOpposition = index1 > 100;
    const index2IsOpposition = index2 > 100;
    
    if (index1IsOpposition && index2IsOpposition) {
        // Both opposition players
        const temp = oppositionPlayerNames[index1];
        oppositionPlayerNames[index1] = oppositionPlayerNames[index2];
        oppositionPlayerNames[index2] = temp;
    } else if (!index1IsOpposition && !index2IsOpposition) {
        // Both our team players
    const temp = playerNames[index1];
    playerNames[index1] = playerNames[index2];
    playerNames[index2] = temp;
    }
    // Don't allow swapping between teams

    updatePlayerLabels(); // Refresh all labels across app
}

// Notes code
function openViewEditNotePopup(index) {
    noteRowIndex = null;
    viewEditNoteIndex = index;
    editingMode = false;
    openNotePopup();
}

function openNotePopup() {
    const index = viewEditNoteIndex !== null ? viewEditNoteIndex : noteRowIndex;
    const entry = actionsLog[index];
    const notes = entry.notes || [];

    // Reset UI
    document.getElementById('note-list').innerHTML = '';
    document.getElementById('custom-note-input').value = '';
    PopupAnimator.showPopup(document.getElementById('note-popup'), 'standard');

    // Show/hide relevant parts based on mode
    const isAddMode = noteRowIndex !== null;
    const isViewEditMode = viewEditNoteIndex !== null;

    // Section visibility
    document.getElementById('quick-note-container').style.display = isAddMode ? 'grid' : 'none';
    document.getElementById('custom-note-input').style.display = isAddMode ? 'block' : 'none';
    document.getElementById('note-confirm-button').style.display = isAddMode ? 'inline-block' : 'none';
    document.getElementById('note-edit-button').style.display = (isViewEditMode && !editingMode) ? 'inline-block' : 'none';

    const container = document.getElementById('note-list');

    // Only show notes if user clicked 📝
    if (isViewEditMode) {
        notes.forEach((note, i) => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('note-item');

            if (editingMode) {
                const input = document.createElement('textarea');
                input.value = note;
                input.classList.add('note-textarea');

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '🗑️';
                deleteBtn.classList.add('delete-note-button');
                deleteBtn.onclick = () => {
                    actionsLog[index].notes.splice(i, 1);
                    updateSummary();
                    openNotePopup(); // Refresh
                };

                wrapper.appendChild(input);
                wrapper.appendChild(deleteBtn);
            } else {
                wrapper.classList.add('note-static');
                wrapper.textContent = note;
            }

            container.appendChild(wrapper);
        });

        // In edit mode, allow new note input at bottom
        if (editingMode) {
            const newInput = document.createElement('textarea');
            newInput.classList.add('note-textarea');
            newInput.placeholder = 'Add a new note...';

            const saveBtn = document.createElement('button');
            saveBtn.textContent = '✅';
            saveBtn.classList.add('delete-note-button');
            saveBtn.onclick = () => {
                const value = newInput.value.trim();
                if (value) {
                    actionsLog[index].notes.push(value);
                    updateSummary();
                    openNotePopup(); // Refresh
                }
            };

            const newNoteDiv = document.createElement('div');
            newNoteDiv.classList.add('note-item');
            newNoteDiv.appendChild(newInput);
            newNoteDiv.appendChild(saveBtn);
            container.appendChild(newNoteDiv);
        }
    }
}

function enterEditNoteMode() {
    editingMode = true;
    openNotePopup();
}

// filter function for summary tab
function setFilter(key, value) {
    filters[key] = value === '-- All --' ? null : value;
    updateSummary(); // Refresh table based on new filters
}

// =========================
// BOTTOM NAVIGATION LOGIC
// =========================

// Handle tab switching from bottom banner
document.querySelectorAll(".bottom-nav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const tabName = btn.getAttribute("data-tab");
        openTab(tabName);
        highlightActiveTab(tabName);
        localStorage.setItem("activeTab", tabName);
        btn.blur();
    });
});

// Settings button in bottom banner
const bottomSettingsBtn = document.getElementById("bottom-settings-btn");
if (bottomSettingsBtn) {
    bottomSettingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof openSettingsPopup === "function") {
            openSettingsPopup();
            bottomSettingsBtn.blur();
        }
    });
}

// Highlight the active sidebar link
function highlightActiveTab(tabName) {
    // Sidebar links (legacy; may not exist)
    document.querySelectorAll(".sidebar-link").forEach(link => {
        if (link.getAttribute("data-tab") === tabName) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
    // Bottom nav buttons
    document.querySelectorAll(".bottom-nav-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tabName) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// Toggle collapsible groups in Review tab - REMOVED (no longer needed with new filter layout)

// Team switching functionality
function switchTeamView(teamType) {
    currentTeamView = teamType;
    
    // Update toggle buttons
    const ourTeamToggle = document.getElementById('our-team-toggle');
    const oppositionToggle = document.getElementById('opposition-toggle');
    
    if (teamType === 'our-team') {
        ourTeamToggle.classList.add('active');
        oppositionToggle.classList.remove('active');
        
        // Show our team view, hide opposition
        document.getElementById('our-team-view').classList.add('active');
        document.getElementById('opposition-view').classList.remove('active');
    } else {
        oppositionToggle.classList.add('active');
        ourTeamToggle.classList.remove('active');
        
        // Show opposition view, hide our team
        document.getElementById('opposition-view').classList.add('active');
        document.getElementById('our-team-view').classList.remove('active');
    }
    
    // Re-initialize drag and drop for the new view
    setTimeout(() => {
        addDragAndTouchEventsToPlayerButtons();
    }, 100);
    
    // Remove focus to prevent stuck pressed state
    if (teamType === 'our-team') {
        ourTeamToggle.blur();
    } else {
        oppositionToggle.blur();
    }
}

// Match Log Team Switching
let currentMatchLogTeam = 1; // Track which team is selected in Match Log

function switchMatchLogTeam(teamNumber) {
    currentMatchLogTeam = teamNumber;
    
    // Update toggle buttons
    const team1Toggle = document.getElementById('match-log-team-1-toggle');
    const team2Toggle = document.getElementById('match-log-team-2-toggle');
    
    if (teamNumber === 1) {
        team1Toggle.classList.add('active');
        team2Toggle.classList.remove('active');
    } else {
        team2Toggle.classList.add('active');
        team1Toggle.classList.remove('active');
    }
    
    // Update text colors for the active toggle only
    // Load team designs to get the correct colors
    const team1Data = loadTeamSheetFromLocalStorage(1);
    const team2Data = loadTeamSheetFromLocalStorage(2);
    
    if (teamNumber === 1) {
        // Team 1 is active - set its text color and reset Team 2
        if (team1Data) {
            const team1TextColor = getContrastColor(team1Data.primaryColor);
            team1Toggle.style.setProperty('color', team1TextColor, 'important');
        }
        // Reset Team 2 to default color
        team2Toggle.style.removeProperty('color');
    } else {
        // Team 2 is active - set its text color and reset Team 1
        if (team2Data) {
            const team2TextColor = getContrastColor(team2Data.primaryColor);
            team2Toggle.style.setProperty('color', team2TextColor, 'important');
        }
        // Reset Team 1 to default color
        team1Toggle.style.removeProperty('color');
    }
    
    // Update action button borders to show selected team
    updateMatchLogActionButtonBorders();
    
    
    // Remove focus to prevent stuck pressed state
    if (teamNumber === 1) {
        team1Toggle.blur();
    } else {
        team2Toggle.blur();
    }
}


function updateMatchLogActionButtonBorders() {
    const actionButtons = document.querySelectorAll('#match-log-action-buttons .action-button');
    
    // Get team data for color calculation
    const team1Data = loadTeamSheetFromLocalStorage(1);
    const team2Data = loadTeamSheetFromLocalStorage(2);
    
    actionButtons.forEach(button => {
        // Remove existing team classes
        button.classList.remove('team-1-active', 'team-2-active');
        
        // Add appropriate team class
        if (currentMatchLogTeam === 1) {
            button.classList.add('team-1-active');
        } else {
            button.classList.add('team-2-active');
        }
        
        // Set text color based on current theme
        updateActionButtonTextColor(button, currentMatchLogTeam, team1Data, team2Data);
    });
    
    // Update action button text based on current team
    updateMatchLogActionButtonText();
}

// Dedicated function to handle action button text colors
function updateActionButtonTextColor(button, teamNumber, team1Data, team2Data) {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDarkMode) {
        // Dark mode: always white text
        button.style.setProperty('color', 'white', 'important');
    } else {
        // Light mode: always black text
        button.style.setProperty('color', 'black', 'important');
    }
}

// Function to update all action button colors (can be called from anywhere)
function updateAllActionButtonColors() {
    const actionButtons = document.querySelectorAll('#match-log-action-buttons .action-button');
    const team1Data = loadTeamSheetFromLocalStorage(1);
    const team2Data = loadTeamSheetFromLocalStorage(2);
    
    actionButtons.forEach(button => {
        updateActionButtonTextColor(button, currentMatchLogTeam, team1Data, team2Data);
    });
}

// Cancel function - returns to Match Log and clears current action
function cancelCurrentAction() {
    // Clear any current action data
    currentAction = {
        action: null,
        definition: null,
        mode: null
    };
    
    // Reset any context flags
    window.matchLogContext = false;
    
    // Return to Match Log tab
    openTab('stats');
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the Match Log action buttons
    const actionButtonsScreen = document.getElementById('match-log-action-buttons');
    if (actionButtonsScreen) {
        actionButtonsScreen.classList.add('active');
    }
}

function updateMatchLogActionButtonText() {
    // Find the kickout button by looking for either "Our Kickout" or "Opp. Kickout" data-action
    const kickoutButton = document.querySelector('#match-log-action-buttons .action-button[data-action="Our Kickout"], #match-log-action-buttons .action-button[data-action="Opp. Kickout"]');
    
    if (kickoutButton) {
        if (currentMatchLogTeam === 1) {
            // Team 1 selected - show "Our Kickout"
            kickoutButton.textContent = 'Our Kickout';
            kickoutButton.setAttribute('data-action', 'Our Kickout');
            kickoutButton.setAttribute('onclick', "selectMatchLogAction('Our Kickout')");
        } else {
            // Team 2 selected - show "Opp. Kickout"
            kickoutButton.textContent = 'Opp. Kickout';
            kickoutButton.setAttribute('data-action', 'Opp. Kickout');
            kickoutButton.setAttribute('onclick', "selectMatchLogAction('Opp. Kickout')");
        }
    }
}

function selectMatchLogAction(action) {
    // Set the current action
    currentAction = action;
    
    // Check if this action has an existing flow
    const hasExistingFlow = checkActionFlow(action);
    
    if (hasExistingFlow) {
        // Use existing flow for both Team 1 and Team 2
        // Store the current tab context
        window.matchLogContext = true;
        // Use the existing selectAction function
        selectAction(action);
    } else {
        // No existing flow - show message
        alert(`Action "${action}" does not have a complete flow yet. This will be implemented in a future update.`);
    }
}

function checkActionFlow(action) {
    // List of actions that have existing flows (Team 1 and Team 2)
    const actionsWithFlows = [
        'Point - Score',
        '2-Point - Score', 
        'Goal - Score',
        'Point - Score (Team 2)',
        '2-Point - Score (Team 2)',
        'Goal - Score (Team 2)',
        'Point - Miss',
        'Goal - Miss',
        '45 Entry',
        'Source of Shot',
        'Free Won',
        'Handpass',
        'Kickpass',
        'Carry',
        'Ball - Won',
        'Ball Won (Forced)',
        'Ball Won (Unforced)',
        'Ball - Lost',
        'Ball Lost (Forced)',
        'Ball Lost (Unforced)',
        'Foul Committed',
        'Pressured Shot',
        'Card Received',
        'Our Kickout',
        'Opp. Kickout',
        'Kickout - Against',
        'Point - Against',
        '2-Point - Against',
        'Goal - Against',
        'Miss - Against'
    ];
    
    return actionsWithFlows.includes(action);
}

function updateMatchLogTeamNames() {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
        // Update Team 1 name
        const team1Name = document.getElementById('match-log-team-1-name');
        const team1Button = document.getElementById('rename-team-1-button');
        
        if (team1Name && team1Button) {
            team1Name.textContent = team1Button.textContent.trim();
        }
        
        // Update Team 2 name
        const team2Name = document.getElementById('match-log-team-2-name');
        const team2Button = document.getElementById('rename-team-2-button');
        
        if (team2Name && team2Button) {
            team2Name.textContent = team2Button.textContent.trim();
        }
        
        // Update Review tab filter team names
        const filterTeam1Name = document.getElementById('filter-team-1-name');
        const filterTeam2Name = document.getElementById('filter-team-2-name');
        
        if (filterTeam1Name && team1Button) {
            filterTeam1Name.textContent = team1Button.textContent.trim();
        }
        
        if (filterTeam2Name && team2Button) {
            filterTeam2Name.textContent = team2Button.textContent.trim();
        }
        
        // Update Stats tab team names
        const statsTeam1Name = document.getElementById('stats-team-1-name');
        const statsTeam2Name = document.getElementById('stats-team-2-name');
        
        if (statsTeam1Name && team1Button) {
            statsTeam1Name.textContent = team1Button.textContent.trim();
        }
        
        if (statsTeam2Name && team2Button) {
            statsTeam2Name.textContent = team2Button.textContent.trim();
        }
        
        // Update action button titles
        updateActionButtonTitles();
        
        // Update action button text based on current team
        updateMatchLogActionButtonText();
    }, 10);
}

function updateActionButtonTitles() {
    // This function is no longer needed - action buttons use static titles
    // Keeping the function to avoid breaking existing calls
}

// Enhanced substitutes toggle with team support
function toggleSubstitutes(teamType = currentTeamView) {
    let subsSection, toggleBtn;
    
    if (teamType === 'our-team') {
        subsSection = document.getElementById('our-subs-section');
        toggleBtn = document.getElementById('our-subs-toggle-btn');
    } else {
        subsSection = document.getElementById('opp-subs-section');
        toggleBtn = document.getElementById('opp-subs-toggle-btn');
    }
    
    if (!subsSection || !toggleBtn) return;
    
    // Prevent double-clicking issues
    if (subsSection.dataset.animating === 'true') return;
    
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');
    const toggleText = toggleBtn.querySelector('.toggle-text');
    
    // Add collapsible class if not present
    subsSection.classList.add('collapsible-content');
    
    // Add enhanced toggle button class
    toggleBtn.classList.add('toggle-button-enhanced');
    
    const isCurrentlyHidden = subsSection.style.display === 'none' || subsSection.classList.contains('collapsed');
    
    const isExpanded = CollapsibleManager.toggle(subsSection, isCurrentlyHidden);
    
    if (isExpanded) {
        // Show substitutes
        subsSection.style.display = 'block';
        toggleBtn.classList.add('expanded');
        toggleIcon.textContent = '▼';
        toggleText.textContent = 'Hide Substitutes';
    } else {
        // Hide substitutes
        toggleBtn.classList.remove('expanded');
        toggleIcon.textContent = '▶';
        toggleText.textContent = 'Show Substitutes';
    }
    
    // Remove focus to prevent stuck pressed state
    toggleBtn.blur();
}

// Team Customization Functions
function openTeamCustomizePopup(teamNumber) {
    currentEditingTeam = teamNumber;
    const customization = teamCustomizations[teamNumber];
    
    // Set current values in the popup
    document.getElementById('primary-color-picker').value = customization.primaryColor;
    document.getElementById('secondary-color-picker').value = customization.secondaryColor;
    
    // Set pattern selection
    document.querySelectorAll('.pattern-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.pattern === customization.pattern) {
            option.classList.add('selected');
        }
    });
    
    // Set secondary color state
    const secondaryNoneBtn = document.getElementById('secondary-none-btn');
    const secondaryPicker = document.getElementById('secondary-color-picker');
    if (customization.hasSecondary) {
        secondaryNoneBtn.classList.remove('active');
        secondaryPicker.style.display = 'block';
    } else {
        secondaryNoneBtn.classList.add('active');
        secondaryPicker.style.display = 'none';
    }
    
    updateCustomizePreview();
    const popup = document.getElementById('team-customize-popup');
    PopupAnimator.showPopup(popup, 'standard');
}

function closeTeamCustomizePopup() {
    const popup = document.getElementById('team-customize-popup');
    PopupAnimator.hidePopup(popup, 'standard', () => {
        currentEditingTeam = null;
    });
}

function confirmTeamCustomization() {
    if (!currentEditingTeam) return;
    
    const pattern = document.querySelector('.pattern-option.selected')?.dataset.pattern || 'solid';
    const primaryColor = document.getElementById('primary-color-picker').value;
    const secondaryColor = document.getElementById('secondary-color-picker').value;
    const hasSecondary = !document.getElementById('secondary-none-btn').classList.contains('active');
    
    // Update team customization
    teamCustomizations[currentEditingTeam] = {
        pattern,
        primaryColor,
        secondaryColor,
        hasSecondary
    };
    
    // Apply customization to UI
    applyTeamCustomization(currentEditingTeam);
    
    // Also apply team design to Review tab filter pills
    const teamData = {
        pattern: pattern,
        primaryColor: primaryColor,
        secondaryColor: hasSecondary ? secondaryColor : primaryColor
    };
    applyTeamDesign(currentEditingTeam, teamData);
    
    closeTeamCustomizePopup();
}

function updateCustomizePreview() {
    const preview = document.getElementById('customize-preview');
    const pattern = document.querySelector('.pattern-option.selected')?.dataset.pattern || 'solid';
    const primaryColor = document.getElementById('primary-color-picker').value;
    const secondaryColor = document.getElementById('secondary-color-picker').value;
    const hasSecondary = !document.getElementById('secondary-none-btn').classList.contains('active');
    
    const style = generateTeamStyle(pattern, primaryColor, hasSecondary ? secondaryColor : null);
    preview.style.background = style.background;
    preview.style.color = style.color;
    preview.style.border = style.border || '1px solid rgba(0, 0, 0, 0.1)';
    
    // Add background-size for checkered pattern
    if (pattern === 'checkered' && hasSecondary) {
        preview.style.backgroundSize = '20px 20px';
    } else {
        preview.style.backgroundSize = 'auto';
    }
}

function generateTeamStyle(pattern, primaryColor, secondaryColor) {
    const textColor = getContrastColor(primaryColor);
    let background, border;
    
    switch (pattern) {
        case 'solid':
            background = primaryColor;
            break;
        case 'diagonal':
            background = secondaryColor 
                ? `linear-gradient(45deg, ${primaryColor} 50%, ${secondaryColor} 50%)`
                : primaryColor;
            break;
        case 'checkered':
            if (secondaryColor) {
                background = `
                    conic-gradient(${primaryColor} 90deg, ${secondaryColor} 90deg 180deg, ${primaryColor} 180deg 270deg, ${secondaryColor} 270deg)
                `;
                border = '1px solid rgba(0, 0, 0, 0.1)';
            } else {
                background = primaryColor;
            }
            break;
        case 'vertical':
            background = secondaryColor
                ? `repeating-linear-gradient(90deg, ${primaryColor} 0px, ${primaryColor} 12px, ${secondaryColor} 12px, ${secondaryColor} 20px)`
                : primaryColor;
            break;
        case 'horizontal':
            background = secondaryColor
                ? `repeating-linear-gradient(0deg, ${primaryColor} 0px, ${primaryColor} 8px, ${secondaryColor} 8px, ${secondaryColor} 14px)`
                : primaryColor;
            break;
        default:
            background = primaryColor;
    }
    
    return { background, color: textColor, border };
}

function getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

function applyTeamCustomization(teamNumber) {
    const customization = teamCustomizations[teamNumber];
    const style = generateTeamStyle(
        customization.pattern, 
        customization.primaryColor, 
        customization.hasSecondary ? customization.secondaryColor : null
    );
    
    // Apply to team name button
    const teamButton = document.getElementById(`rename-team-${teamNumber}-button`);
    if (teamButton) {
        teamButton.style.setProperty('background', style.background, 'important');
        teamButton.style.setProperty('color', style.color, 'important');
        if (style.border) teamButton.style.border = style.border;
        
        // Add background-size for checkered pattern
        if (customization.pattern === 'checkered' && customization.hasSecondary) {
            teamButton.style.backgroundSize = '20px 20px';
        }
    }
    
    // Apply to player buttons
    const playerPrefix = teamNumber === 1 ? 'player-' : 'opp-player-';
    for (let i = 1; i <= 30; i++) {
        const playerButton = document.getElementById(`${playerPrefix}${i}-button`);
        if (playerButton) {
            playerButton.style.background = style.background + ' !important';
            playerButton.style.color = style.color + ' !important';
            if (style.border) playerButton.style.border = style.border;
            
            // Add background-size for checkered pattern
            if (customization.pattern === 'checkered' && customization.hasSecondary) {
                playerButton.style.backgroundSize = '20px 20px';
            }
            
            // Remove any conflicting CSS classes that might override our styles
            playerButton.style.setProperty('background', style.background, 'important');
            playerButton.style.setProperty('color', style.color, 'important');
        }
    }
    
    // Apply to player selection screens
    if (teamNumber === 1) {
        // Apply to "Select Player" screen buttons
        document.querySelectorAll('#player-buttons .player-button[aria-label^="Select Player"]').forEach(button => {
            button.style.setProperty('background', style.background, 'important');
            button.style.setProperty('color', style.color, 'important');
            if (style.border) button.style.border = style.border;
            
            if (customization.pattern === 'checkered' && customization.hasSecondary) {
                button.style.backgroundSize = '20px 20px';
            }
        });
        
        // Apply to "Select Receiver" screen buttons
        document.querySelectorAll('#player-buttons-second .player-button[aria-label^="Select Receiver"]').forEach(button => {
            button.style.setProperty('background', style.background, 'important');
            button.style.setProperty('color', style.color, 'important');
            if (style.border) button.style.border = style.border;
            
            if (customization.pattern === 'checkered' && customization.hasSecondary) {
                button.style.backgroundSize = '20px 20px';
            }
        });
    } else if (teamNumber === 2) {
        // Apply to Team 2 first player selection screen buttons
        document.querySelectorAll('#player-buttons-team2 .player-button[aria-label^="Select Player"]').forEach(button => {
            button.style.setProperty('background', style.background, 'important');
            button.style.setProperty('color', style.color, 'important');
            if (style.border) button.style.border = style.border;
            
            if (customization.pattern === 'checkered' && customization.hasSecondary) {
                button.style.backgroundSize = '20px 20px';
            }
        });
        
        // Apply to Team 2 second player selection screen buttons
        document.querySelectorAll('#player-buttons-second-team2 .player-button[aria-label^="Select Player"]').forEach(button => {
            button.style.setProperty('background', style.background, 'important');
            button.style.setProperty('color', style.color, 'important');
            if (style.border) button.style.border = style.border;
            
            if (customization.pattern === 'checkered' && customization.hasSecondary) {
                button.style.backgroundSize = '20px 20px';
            }
        });
    }
    
    // Apply to banner
    updateBannerStyling();
    
    // Apply to timeline action boxes
    updateTimelineColors();
}

function updateBannerStyling() {
    const team1Style = generateTeamStyle(
        teamCustomizations[1].pattern,
        teamCustomizations[1].primaryColor,
        teamCustomizations[1].hasSecondary ? teamCustomizations[1].secondaryColor : null
    );
    
    const team2Style = generateTeamStyle(
        teamCustomizations[2].pattern,
        teamCustomizations[2].primaryColor,
        teamCustomizations[2].hasSecondary ? teamCustomizations[2].secondaryColor : null
    );
    
    // Apply to banner sections
    const banner = document.getElementById('counters');
    if (banner) {
        const team1Section = banner.querySelector('.counter-container:first-child');
        const team2Section = banner.querySelector('.counter-container:last-child');
        
        if (team1Section) {
            team1Section.style.background = team1Style.background;
            team1Section.style.color = team1Style.color;
            team1Section.style.borderRadius = 'var(--radius-lg)';
            team1Section.style.padding = 'var(--space-sm) var(--space-md)';
            if (team1Style.border) team1Section.style.border = team1Style.border;
            
            // Apply checkered pattern background-size if needed
            if (teamCustomizations[1].pattern === 'checkered' && teamCustomizations[1].hasSecondary) {
                team1Section.style.backgroundSize = '20px 20px';
            }
            
            // Apply text color to all child elements
            const team1Name = team1Section.querySelector('.team-name');
            const team1Counter = team1Section.querySelector('.counter');
            if (team1Name) team1Name.style.color = team1Style.color;
            if (team1Counter) team1Counter.style.color = team1Style.color;
        }
        
        if (team2Section) {
            team2Section.style.background = team2Style.background;
            team2Section.style.color = team2Style.color;
            team2Section.style.borderRadius = 'var(--radius-lg)';
            team2Section.style.padding = 'var(--space-sm) var(--space-md)';
            if (team2Style.border) team2Section.style.border = team2Style.border;
            
            // Apply checkered pattern background-size if needed
            if (teamCustomizations[2].pattern === 'checkered' && teamCustomizations[2].hasSecondary) {
                team2Section.style.backgroundSize = '20px 20px';
            }
            
            // Apply text color to all child elements
            const team2Name = team2Section.querySelector('.team-name');
            const team2Counter = team2Section.querySelector('.counter');
            if (team2Name) team2Name.style.color = team2Style.color;
            if (team2Counter) team2Counter.style.color = team2Style.color;
        }
    }
}

// Restore last active tab from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedTab = localStorage.getItem("activeTab") || "home";
    openTab(savedTab);
    highlightActiveTab(savedTab);

    // Ensure both substitutes sections start closed
    const ourSubsSection = document.getElementById('our-subs-section');
    const ourToggleBtn = document.getElementById('our-subs-toggle-btn');
    if (ourSubsSection && ourToggleBtn) {
        ourSubsSection.style.display = 'none';
        ourSubsSection.classList.add('collapsed');
        ourToggleBtn.classList.remove('expanded');
    }
    
    const oppSubsSection = document.getElementById('opp-subs-section');
    const oppToggleBtn = document.getElementById('opp-subs-toggle-btn');
    if (oppSubsSection && oppToggleBtn) {
        oppSubsSection.style.display = 'none';
        oppSubsSection.classList.add('collapsed');
        oppToggleBtn.classList.remove('expanded');
    }
    
    // Initialize team customization event listeners
    initializeCustomizationListeners();
    
    // Apply initial team customizations
    applyTeamCustomization(1);
    applyTeamCustomization(2);
    
    // Initialize summary view
    switchSummaryView('timeline');
});

function initializeCustomizationListeners() {
    // Pattern selection
    document.querySelectorAll('.pattern-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.pattern-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            updateCustomizePreview();
        });
    });
    
    // Color picker changes
    document.getElementById('primary-color-picker').addEventListener('input', updateCustomizePreview);
    document.getElementById('secondary-color-picker').addEventListener('input', updateCustomizePreview);
    
    // Color presets
    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.dataset.color;
            const isPrimarySection = preset.closest('.customize-section').querySelector('#primary-color-picker');
            
            if (isPrimarySection) {
                document.getElementById('primary-color-picker').value = color;
            } else {
                document.getElementById('secondary-color-picker').value = color;
                // Enable secondary color if it was disabled
                const secondaryNoneBtn = document.getElementById('secondary-none-btn');
                if (secondaryNoneBtn.classList.contains('active')) {
                    secondaryNoneBtn.classList.remove('active');
                    document.getElementById('secondary-color-picker').style.display = 'block';
                }
            }
            updateCustomizePreview();
        });
    });
    
    // Secondary "None" button
    document.getElementById('secondary-none-btn').addEventListener('click', () => {
        const btn = document.getElementById('secondary-none-btn');
        const picker = document.getElementById('secondary-color-picker');
        
        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            picker.style.display = 'block';
        } else {
            btn.classList.add('active');
            picker.style.display = 'none';
        }
        updateCustomizePreview();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const popup = document.getElementById('team-customize-popup');
        if (popup.style.display === 'block') {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmTeamCustomization();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeTeamCustomizePopup();
            }
        }
    });
}

// Summary View Management
function switchSummaryView(viewType) {
    currentSummaryView = viewType;
    
    // Update toggle buttons
    const timelineToggle = document.getElementById('timeline-toggle');
    const tableToggle = document.getElementById('table-toggle');
    
    if (viewType === 'timeline') {
        timelineToggle.classList.add('active');
        tableToggle.classList.remove('active');
        
        // Show timeline view, hide table
        document.getElementById('timeline-view').classList.add('active');
        document.getElementById('table-view').classList.remove('active');
        
        // Rebuild timeline
        buildTimeline();
    } else {
        tableToggle.classList.add('active');
        timelineToggle.classList.remove('active');
        
        // Show table view, hide timeline
        document.getElementById('table-view').classList.add('active');
        document.getElementById('timeline-view').classList.remove('active');
    }
    
    // Remove focus to prevent stuck pressed state
    if (viewType === 'timeline') {
        timelineToggle.blur();
    } else {
        tableToggle.blur();
    }
}

// Timeline Functions
function buildTimeline() {
    const timelineContent = document.getElementById('timeline-content');
    timelineContent.innerHTML = '';
    
    // Check if there are any actions
    if (actionsLog.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'timeline-empty-message';
        emptyMessage.innerHTML = `
            <div class="empty-timeline-icon">📋</div>
            <div class="empty-timeline-text">No actions logged yet</div>
            <div class="empty-timeline-subtext">Actions will appear here as they are logged</div>
        `;
        timelineContent.appendChild(emptyMessage);
        
        // Hide timeline line when no actions
        const timelineLine = document.querySelector('.timeline-line');
        if (timelineLine) {
            timelineLine.style.display = 'none';
        }
        return;
    }
    
    // Show timeline line when actions exist
    const timelineLine = document.querySelector('.timeline-line');
    if (timelineLine) {
        timelineLine.style.display = 'block';
    }
    
    // Create timeline items from actionsLog (newest first)
    const sortedActions = [...actionsLog].reverse();
    
    sortedActions.forEach((action, index) => {
        const originalIndex = actionsLog.length - 1 - index; // Calculate original index
        const timelineItem = createTimelineItem(action, originalIndex);
        timelineContent.appendChild(timelineItem);
    });
    
    // Update timeline line height and colors after content is added
    updateTimelineHeight();
    updateTimelineColors();
}

function updateTimelineHeight() {
    // Wait for DOM to update, then set timeline line height
    setTimeout(() => {
        const timelineContent = document.getElementById('timeline-content');
        const timelineLine = document.querySelector('.timeline-line');
        
        if (timelineContent && timelineLine) {
            const contentHeight = timelineContent.scrollHeight;
            timelineLine.style.height = `${Math.max(contentHeight, 200)}px`;
        }
    }, 10);
}

function createTimelineItem(action, index) {
    const item = document.createElement('div');
    item.className = `timeline-item ${getTeamFromAction(action)}`;
    
    // Create timeline dot
    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    
    // Create action box
    const actionBox = document.createElement('div');
    actionBox.className = 'timeline-action-box';
    
    // Action title
    const title = document.createElement('div');
    title.className = 'timeline-action-title';
    title.textContent = action.action;
    
    // Action details (mode/definition)
    const details = document.createElement('div');
    details.className = 'timeline-action-details';
    const detailsText = [];
    if (action.mode && action.mode.trim()) detailsText.push(`Type: ${action.mode}`);
    if (action.definition && action.definition.trim()) detailsText.push(`How: ${action.definition}`);
    details.textContent = detailsText.join(' • ');
    
    // Players
    const players = document.createElement('div');
    players.className = 'timeline-action-players';
    const playersText = [];
    if (action.player && action.player.trim()) playersText.push(action.player);
    if (action.player2 && action.player2.trim()) playersText.push(`→ ${action.player2}`);
    players.textContent = playersText.join(' ');
    
    // Notes section
    if (action.notes && action.notes.length > 0) {
        const notesSection = document.createElement('div');
        notesSection.className = 'timeline-action-notes';
        
        const notesTitle = document.createElement('div');
        notesTitle.className = 'timeline-notes-title';
        notesTitle.innerHTML = '📝 Notes';
        notesSection.appendChild(notesTitle);
        
        action.notes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'timeline-note-item';
            noteItem.textContent = note;
            notesSection.appendChild(noteItem);
        });
        
        actionBox.appendChild(notesSection);
    }
    
    // Timestamp (action number)
    const timestamp = document.createElement('div');
    timestamp.className = 'timeline-action-timestamp';
    timestamp.textContent = `Action #${actionsLog.length - index}`;
    
    // Assemble action box
    actionBox.appendChild(title);
    if (details.textContent) actionBox.appendChild(details);
    if (players.textContent) actionBox.appendChild(players);
    actionBox.appendChild(timestamp);
    
    // Make action box clickable
    actionBox.style.cursor = 'pointer';
    actionBox.addEventListener('click', (e) => {
        e.stopPropagation();
        showTimelineRowOptionsMenu(e.currentTarget, index); // Use index directly (already original index)
    });
    
    // Assemble timeline item
    item.appendChild(dot);
    item.appendChild(actionBox);
    
    return item;
}

function getTeamFromAction(action) {
    // First, check if the action has a teamNumber (most reliable)
    if (action.teamNumber !== undefined && action.teamNumber !== null) {
        return action.teamNumber === 1 ? 'team1' : 'team2';
    }
    
    // Fallback: check if the action already has stored team information
    if (action.team) {
        // Get the current team names to compare
        const team1Button = document.getElementById('rename-team-1-button');
        const team2Button = document.getElementById('rename-team-2-button');
        const currentTeam1Name = team1Button ? team1Button.textContent.trim() : 'Team 1';
        const currentTeam2Name = team2Button ? team2Button.textContent.trim() : 'Team 2';
        
        // Check if the stored team name matches Team 2
        if (action.team === currentTeam2Name || action.team.includes('Team 2') || action.team.includes('team2')) {
            return 'team2';
        } else {
            return 'team1';
        }
    }
    
    // Always Team 1 actions (our team) - unless in Team 2 Match Log context
    const alwaysTeam1Actions = [
        'Point - Score',
        '2-Point - Score',
        'Goal - Score',
        'Point - Miss',
        'Goal - Miss',
        '45 Entry',
        'Source of Shot'
    ];
    
    // Always Team 2 actions (opposition)
    const alwaysTeam2Actions = [
        'Kickout - Against',
        'Point - Against',
        '2-Point - Against', 
        'Goal - Against',
        'Miss - Against'
    ];
    
    // Check always Team 1 actions first - but consider Match Log context
    if (alwaysTeam1Actions.includes(action.action)) {
        // If we're in Team 2 Match Log context, these actions belong to Team 2
        if (window.matchLogContext && currentMatchLogTeam === 2) {
            return 'team2';
        }
        return 'team1';
    }
    
    // Check always Team 2 actions
    if (alwaysTeam2Actions.includes(action.action)) {
        return 'team2';
    }
    
    // Special case: Our Kickout - always Team 1
    if (action.action === 'Our Kickout') {
        return 'team1';
    }
    
    // Special case: Opp. Kickout - always Team 2
    if (action.action === 'Opp. Kickout') {
        return 'team2';
    }
    
    // For any other actions, check if we're in Match Log context
    if (window.matchLogContext && currentMatchLogTeam) {
        return currentMatchLogTeam === 1 ? 'team1' : 'team2';
    }
    
    // Default to team 1
    return 'team1';
}

function addToTimeline(action) {
    if (currentSummaryView === 'timeline') {
        const timelineContent = document.getElementById('timeline-content');
        const newItem = createTimelineItem(action, 0);
        
        // Add to top of timeline
        if (timelineContent.firstChild) {
            timelineContent.insertBefore(newItem, timelineContent.firstChild);
        } else {
            timelineContent.appendChild(newItem);
        }
        
        // Update action numbers for existing items
        updateTimelineNumbers();
        
        // Update timeline line height and colors
        updateTimelineHeight();
        updateTimelineColors();
    }
}

function updateTimelineNumbers() {
    const timelineItems = document.querySelectorAll('.timeline-action-timestamp');
    timelineItems.forEach((timestamp, index) => {
        timestamp.textContent = `Action #${actionsLog.length - index}`;
    });
}

// Timeline context menu functions
function showTimelineRowOptionsMenu(element, index) {
    currentRowIndex = index;
    const popup = document.getElementById('row-options-popup');
	if (!popup) return;
	// Position popup near the timeline entry clicked
	positionRowOptionsPopup(popup, element);
	PopupAnimator.showPopup(popup, 'menu');
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', hideRowOptionsMenu, { once: true });
    }, 10);
}

// Utility to position the row options popup relative to an anchor element
function positionRowOptionsPopup(popup, anchorEl) {
	try {
		const rect = anchorEl.getBoundingClientRect();
		const scrollX = window.scrollX || window.pageXOffset;
		const scrollY = window.scrollY || window.pageYOffset;
		const OFFSET_X = 8;
		const OFFSET_Y = 0;

		// Temporarily show to measure size
		const prevDisplay = popup.style.display;
		const prevVisibility = popup.style.visibility;
		popup.style.visibility = 'hidden';
		popup.style.display = 'block';

		const popupWidth = popup.offsetWidth || 200;
		const popupHeight = popup.offsetHeight || 200;

		let left = rect.right + OFFSET_X + scrollX;
		let top = rect.top + OFFSET_Y + scrollY;

		// Keep within viewport horizontally
		const viewportRight = scrollX + window.innerWidth;
		if (left + popupWidth > viewportRight - 8) {
			left = rect.left - popupWidth - OFFSET_X + scrollX;
		}
		if (left < scrollX + 8) {
			left = scrollX + 8;
		}

		// Keep within viewport vertically
		const viewportBottom = scrollY + window.innerHeight;
		if (top + popupHeight > viewportBottom - 8) {
			const downShift = (top + popupHeight) - (viewportBottom - 8);
			top = Math.max(scrollY + 8, top - downShift);
		}

		popup.style.left = `${left}px`;
		popup.style.top = `${top}px`;

		// Restore visibility; keep display as set for showPopup
		popup.style.visibility = prevVisibility || 'visible';
		popup.style.display = prevDisplay || 'block';
	} catch (e) {
		// Fallback: let it render where CSS positions it
	}
}

// Action-specific note presets
const actionNotePresets = {
    'Point - Score': [
        'Great Assist',
        'Momentum Swing', 
        'Worth Another Look',
        'Clutch Score',
        'Perfect Execution'
    ],
    'Goal - Score': [
        'Spectacular Finish',
        'Game Changer',
        'Clinical Strike',
        'Unstoppable Shot',
        'Perfect Timing'
    ],
    'Point - Miss': [
        'Unlucky Attempt',
        'Good Effort',
        'Pressure Shot',
        'Review Technique',
        'Close Call'
    ],
    'Goal - Miss': [
        'Great Chance',
        'Keeper Save',
        'Post/Crossbar',
        'Under Pressure',
        'Review Positioning'
    ],
    'Free - Won': [
        'Smart Play',
        'Drew Contact',
        'Good Positioning',
        'Tactical Foul',
        'Earned Advantage'
    ],
    'Handpass': [
        'Great Vision',
        'Quick Thinking',
        'Perfect Timing',
        'Under Pressure',
        'Good Support'
    ],
    'Kickpass': [
        'Accurate Delivery',
        'Long Range',
        'Perfect Weight',
        'Under Pressure',
        'Great Vision'
    ],
    'Carry': [
        'Powerful Run',
        'Beat Defender',
        'Good Pace',
        'Created Space',
        'Strong Finish'
    ],
    'Ball - Won': [
        'Great Tackle',
        'Intercepted',
        'Strong Challenge',
        'Good Positioning',
        'Turnover Created'
    ],
    'Ball - Lost': [
        'Forced Error',
        'Under Pressure',
        'Poor Decision',
        'Review Options',
        'Turnover'
    ],
    'Foul': [
        'Tactical Foul',
        'Accidental',
        'Frustrated',
        'Poor Discipline',
        'Review Technique'
    ],
    'Kickout - For': [
        'Good Distance',
        'Accurate',
        'Under Pressure',
        'Quick Release',
        'Strategic'
    ],
    'Kickout - Against': [
        'Poor Clearance',
        'Intercepted',
        'Under Pressure',
        'Review Positioning',
        'Tactical Error'
    ],
    'Point - Against': [
        'Defensive Lapse',
        'Good Opposition',
        'Unlucky',
        'Review Marking',
        'Pressure Score'
    ],
    '2-Point - Against': [
        'Defensive Error',
        'Great Opposition',
        'Poor Positioning',
        'Review Setup',
        'Unlucky Break'
    ],
    'Goal - Against': [
        'Defensive Breakdown',
        'Excellent Finish',
        'Keeper Error',
        'Review Marking',
        'Unstoppable'
    ],
    'Miss - Against': [
        'Good Defense',
        'Pressure Applied',
        'Lucky Escape',
        'Keeper Save',
        'Poor Finish'
    ]
};

function updateTimelineColors() {
    // Get current team styles
    const team1Style = generateTeamStyle(
        teamCustomizations[1].pattern,
        teamCustomizations[1].primaryColor,
        teamCustomizations[1].hasSecondary ? teamCustomizations[1].secondaryColor : null
    );
    
    const team2Style = generateTeamStyle(
        teamCustomizations[2].pattern,
        teamCustomizations[2].primaryColor,
        teamCustomizations[2].hasSecondary ? teamCustomizations[2].secondaryColor : null
    );
    
    // Apply to timeline action boxes
    document.querySelectorAll('.timeline-item.team1 .timeline-action-box').forEach(box => {
        // Set the top border color using the ::after pseudo-element
        box.style.setProperty('--team-color', team1Style.background);
        
        // Update the details border color
        const details = box.querySelector('.timeline-action-details');
        if (details) {
            details.style.borderLeftColor = team1Style.background;
        }
    });
    
    document.querySelectorAll('.timeline-item.team2 .timeline-action-box').forEach(box => {
        // Set the top border color using the ::after pseudo-element
        box.style.setProperty('--team-color', team2Style.background);
        
        // Update the details border color
        const details = box.querySelector('.timeline-action-details');
        if (details) {
            details.style.borderLeftColor = team2Style.background;
        }
    });
    
    // Update timeline dots
    document.querySelectorAll('.timeline-item.team1 .timeline-dot').forEach(dot => {
        dot.style.borderColor = team1Style.background;
    });
    
    document.querySelectorAll('.timeline-item.team2 .timeline-dot').forEach(dot => {
        dot.style.borderColor = team2Style.background;
    });
}

// --- Team Sheet Export/Import System (v1) ---

// Configuration and constants
const TEAM_SHEET_VERSION = '1';
const SUPPORTED_PATTERNS = ['classic', 'hooped', 'vertical', 'sash', 'diagonal', 'solid', 'custom', 'checkered', 'horizontal'];
const REQUIRED_CSV_COLUMNS = ['team_name', 'pattern', 'primary_color', 'secondary_color', 'player_role', 'number', 'name'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Color normalization mapping
const CSS_COLOR_NAMES = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'green': '#008000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'gray': '#808080',
    'grey': '#808080'
};

// Pattern mapping (internal to CSV format)
const PATTERN_MAPPING = {
    'solid': 'solid',
    'diagonal': 'diagonal', 
    'checkered': 'classic',
    'vertical': 'vertical',
    'horizontal': 'hooped',
    'custom': 'custom'
};

// RFC4180-compliant CSV parser
function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < text.length) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator
            currentRow.push(currentField);
            currentField = '';
            i++;
        } else if (char === '\n' || char === '\r') {
            // Row separator
            if (!inQuotes) {
                currentRow.push(currentField);
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
                // Skip \r\n combination
                if (char === '\r' && nextChar === '\n') {
                    i += 2;
                } else {
                    i++;
                }
            } else {
                currentField += char;
                i++;
            }
        } else {
            currentField += char;
            i++;
        }
    }
    
    // Add final field and row
    if (currentField !== '' || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }
    
    return rows;
}

// Normalize color to #RRGGBB format
function normalizeColor(colorInput) {
    if (!colorInput) return '#000000';
    
    const color = colorInput.trim().toLowerCase();
    
    // Handle CSS color names
    if (CSS_COLOR_NAMES[color]) {
        return CSS_COLOR_NAMES[color];
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
        if (color.length === 4) {
            // #RGB -> #RRGGBB
            return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
        } else if (color.length === 7) {
            return color.toUpperCase();
        }
    }
    
    // Handle rgb() format
    const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
        const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
        const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`.toUpperCase();
    }
    
    // Handle rgba() format (ignore alpha)
    const rgbaMatch = color.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/);
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0');
        const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0');
        const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`.toUpperCase();
    }
    
    // If unrecognized, return black
    return '#000000';
}

// Normalize pattern name
function normalizePattern(patternInput) {
    if (!patternInput) return 'classic';
    
    const pattern = patternInput.trim().toLowerCase();
    
    // Direct mapping
    if (SUPPORTED_PATTERNS.includes(pattern)) {
        return pattern;
    }
    
    // Fallback to classic
    return 'classic';
}

// Generate safe filename
function generateFilename(teamName, teamNumber) {
    const otherTeamNumber = teamNumber === 1 ? 2 : 1;
    const otherTeamName = document.getElementById(`rename-team-${otherTeamNumber}-button`).textContent;
    
    const safeCurrentName = teamName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const safeOtherName = otherTeamName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    return `${safeCurrentName}: Team Sheet vs ${safeOtherName}.csv`;
}

// Export team sheet as CSV
function saveTeamSheet(teamNumber) {
    try {
        const teamButton = document.getElementById(`rename-team-${teamNumber}-button`);
        if (!teamButton) {
            throw new Error(`Team button not found for team ${teamNumber}`);
        }
        
        const teamName = teamButton.textContent;
        const teamData = teamCustomizations[teamNumber];
        
        if (!teamData) {
            throw new Error(`Team customization data not found for team ${teamNumber}`);
        }
        
        const currentPlayerNames = teamNumber === 1 ? playerNames : oppositionPlayerNames;
        
        if (!currentPlayerNames) {
            throw new Error(`Player names not found for team ${teamNumber}`);
        }
        
        const teamSide = teamNumber === 1 ? 'our' : 'opp';
        
        // Build CSV rows
        const csvRows = [REQUIRED_CSV_COLUMNS]; // Header row
        
        // Add starting players
        const startIndex = teamNumber === 1 ? 1 : 101;
        const endStartIndex = teamNumber === 1 ? 15 : 115;
        
        for (let i = startIndex; i <= endStartIndex; i++) {
            const playerData = currentPlayerNames[i];
            if (playerData) {
                const parts = playerData.split(' - ');
                const number = parts[0] ? parts[0].replace('#', '') : (teamNumber === 1 ? i : i - 100).toString();
                const name = parts[1] || `Player ${teamNumber === 1 ? i : i - 100}`;
                
                csvRows.push([
                    teamName,
                    normalizePattern(teamData.pattern || 'classic'),
                    normalizeColor(teamData.primaryColor || '#2563eb'),
                    normalizeColor(teamData.secondaryColor || '#1d4ed8'),
                    'starter',
                    number,
                    name
                ]);
            }
        }
        
        // Add substitutes
        const subStartIndex = teamNumber === 1 ? 16 : 116;
        const subEndIndex = teamNumber === 1 ? 30 : 130;
        
        for (let i = subStartIndex; i <= subEndIndex; i++) {
            const playerData = currentPlayerNames[i];
            if (playerData) {
                const parts = playerData.split(' - ');
                const number = parts[0] ? parts[0].replace('#', '') : (teamNumber === 1 ? i : i - 100).toString();
                const name = parts[1] || `Substitute ${teamNumber === 1 ? i - 15 : i - 115}`;
                
                csvRows.push([
                    teamName,
                    normalizePattern(teamData.pattern || 'classic'),
                    normalizeColor(teamData.primaryColor || '#2563eb'),
                    normalizeColor(teamData.secondaryColor || '#1d4ed8'),
                    'sub',
                    number,
                    name
                ]);
            }
        }
        
        // Convert to CSV string
        const csvContent = csvRows.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const filename = generateFilename(teamName, teamNumber);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        showTemporaryMessage(`Team sheet saved: ${filename}`, 'success');
        
    } catch (error) {
        console.error('Error saving team sheet:', error);
        showTemporaryMessage('Error saving team sheet. Please try again.', 'error');
    }
}

// Upload team sheet
function uploadTeamSheet(teamNumber) {
    const fileInput = document.getElementById(`team-${teamNumber}-file-input`);
    fileInput.click();
}

// Handle file upload
function handleFileUpload(teamNumber, fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showTemporaryMessage('Please upload a .csv team sheet.', 'error');
        return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        showTemporaryMessage('File too large. Maximum size is 2MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const result = importTeamSheet(e.target.result, teamNumber);
            
            if (result.success) {
                showTemporaryMessage(result.message, 'success');
                if (result.warnings.length > 0) {
                    setTimeout(() => {
                        showTemporaryMessage(`Warnings: ${result.warnings.join(', ')}`, 'warning');
                    }, 2000);
                }
            } else {
                showTemporaryMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Error parsing team sheet:', error);
            showTemporaryMessage('Error parsing team sheet. Please check the file format.', 'error');
        }
    };
    
    reader.onerror = function() {
        showTemporaryMessage('Error reading file. Please try again.', 'error');
    };
    
    reader.readAsText(file, 'UTF-8');
    
    // Reset file input
    fileInput.value = '';
}

// Import team sheet with comprehensive validation
function importTeamSheet(csvContent, teamNumber) {
    const result = {
        success: false,
        message: '',
        warnings: [],
        errors: []
    };
    
    try {
        // Parse CSV
        const rows = parseCSV(csvContent);
        
        if (rows.length < 2) {
            result.message = 'Invalid team-sheet file. File appears to be empty or malformed.';
            return result;
        }
        
        // Validate header
        const headerRow = rows[0];
        const missingColumns = REQUIRED_CSV_COLUMNS.filter(col => !headerRow.includes(col));
        
        if (missingColumns.length > 0) {
            result.message = `Invalid team-sheet file. Required columns missing: ${missingColumns.join(', ')}.`;
            return result;
        }
        
        // Get column indices
        const columnIndices = {};
        REQUIRED_CSV_COLUMNS.forEach(col => {
            columnIndices[col] = headerRow.indexOf(col);
        });
        
        // Parse data rows - use all rows regardless of team_side
        const teamRows = rows.slice(1).filter(row => row.length >= REQUIRED_CSV_COLUMNS.length);
        
        if (teamRows.length === 0) {
            result.message = 'No valid rows found in the CSV file.';
            return result;
        }
        
        // Validate required fields and collect metadata
        let teamName = '';
        let pattern = 'classic';
        let primaryColor = '#000000';
        let secondaryColor = '#FFFFFF';
        const starters = [];
        const subs = [];
        const invalidRows = [];
        
        for (let i = 0; i < teamRows.length; i++) {
            const row = teamRows[i];
            
            try {
                const rowTeamName = row[columnIndices.team_name]?.trim();
                const rowPattern = row[columnIndices.pattern]?.trim();
                const rowPrimaryColor = row[columnIndices.primary_color]?.trim();
                const rowSecondaryColor = row[columnIndices.secondary_color]?.trim();
                const playerRole = row[columnIndices.player_role]?.trim().toLowerCase();
                const number = row[columnIndices.number]?.trim();
                const name = row[columnIndices.name]?.trim();
                
                // Validate required fields
                if (!name) {
                    invalidRows.push(`Row ${i + 2}: missing name`);
                    continue;
                }
                
                if (!playerRole || (playerRole !== 'starter' && playerRole !== 'sub')) {
                    invalidRows.push(`Row ${i + 2}: invalid player_role (must be 'starter' or 'sub')`);
                    continue;
                }
                
                // Collect metadata from first valid row
                if (i === 0 || !teamName) {
                    if (rowTeamName) teamName = rowTeamName;
                    if (rowPattern) pattern = normalizePattern(rowPattern);
                    if (rowPrimaryColor) primaryColor = normalizeColor(rowPrimaryColor);
                    if (rowSecondaryColor) secondaryColor = normalizeColor(rowSecondaryColor);
                }
                
                // Parse player number
                let playerNumber = '';
                if (number) {
                    const num = parseInt(number);
                    if (!isNaN(num) && num > 0) {
                        playerNumber = num.toString();
                    }
                }
                
                const playerData = {
                    number: playerNumber,
                    name: name
                };
                
                if (playerRole === 'starter') {
                    starters.push(playerData);
                } else {
                    subs.push(playerData);
                }
                
            } catch (rowError) {
                invalidRows.push(`Row ${i + 2}: ${rowError.message}`);
            }
        }
        
        // Check for at least one starter
        if (starters.length === 0) {
            result.message = 'No valid starter players found. At least one starter is required.';
            return result;
        }
        
        // Validate team name
        if (!teamName) {
            teamName = teamNumber === 1 ? 'Team 1' : 'Team 2';
            result.warnings.push('No team name found, using default.');
        }
        
        // Apply changes
        applyTeamSheetData(teamNumber, {
            teamName,
            pattern,
            primaryColor,
            secondaryColor,
            starters,
            subs
        });
        
        // Persist to localStorage
        saveTeamSheetToLocalStorage(teamNumber, {
            teamName,
            pattern,
            primaryColor,
            secondaryColor,
            starters,
            subs
        });
        
        // Build success message
        let message = `Imported team sheet for "${teamName}" — ${starters.length} starters`;
        if (subs.length > 0) {
            message += `, ${subs.length} subs`;
        }
        message += ' applied. Colors & pattern updated.';
        
        if (invalidRows.length > 0) {
            result.warnings.push(`${invalidRows.length} invalid rows ignored: ${invalidRows.slice(0, 3).join(', ')}${invalidRows.length > 3 ? '...' : ''}`);
        }
        
        result.success = true;
        result.message = message;
        
    } catch (error) {
        result.message = `Error parsing team sheet: ${error.message}`;
    }
    
    return result;
}

// Apply team sheet data to the app
function applyTeamSheetData(teamNumber, data) {
    // Update team name
    const teamButton = document.getElementById(`rename-team-${teamNumber}-button`);
    if (teamButton) {
        teamButton.textContent = data.teamName;
    }
    
    // Update banner team name
    const bannerTeamName = document.querySelectorAll('.counter-container .team-name')[teamNumber - 1];
    if (bannerTeamName) {
        bannerTeamName.textContent = `${data.teamName}:`;
    }
    
    // Update Match Log team names
    updateMatchLogTeamNames();
    
    // Update save button text
    const saveButton = document.getElementById(`save-team-${teamNumber}-button`);
    if (saveButton) {
        const buttonText = saveButton.querySelector('.button-text');
        if (buttonText) {
            buttonText.textContent = `Save Team Sheet`;
        }
    }
    
    // Update team customization
    teamCustomizations[teamNumber] = {
        ...teamCustomizations[teamNumber],
        pattern: data.pattern,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        hasSecondary: true
    };
    
    // Apply team design
    applyTeamDesign(teamNumber, data);
    
    // Apply team customization to update colors throughout the app
    applyTeamCustomization(teamNumber);
    
    // Update banner styling
    updateBannerStyling();
    
    // Update timeline colors
    updateTimelineColors();
    
    // Update player data
    if (teamNumber === 1) {
        // Clear existing data for Team 1 (indices 1-30)
        for (let i = 1; i <= 30; i++) {
            delete playerNames[i];
        }
        
        // Apply starters (1-15)
        data.starters.forEach((player, index) => {
            const playerIndex = index + 1;
            const number = player.number ? `#${player.number}` : `#${playerIndex}`;
            playerNames[playerIndex] = `${number} - ${player.name}`;
        });
        
        // Apply substitutes (16-30)
        data.subs.forEach((player, index) => {
            const playerIndex = index + 16;
            const number = player.number ? `#${player.number}` : `#${playerIndex}`;
            playerNames[playerIndex] = `${number} - ${player.name}`;
        });
    } else {
        // Clear existing data for Team 2 (indices 101-130)
        for (let i = 101; i <= 130; i++) {
            delete oppositionPlayerNames[i];
        }
        
        // Apply starters (101-115)
        data.starters.forEach((player, index) => {
            const playerIndex = index + 101;
            const number = player.number ? `#${player.number}` : `#${playerIndex - 100}`;
            oppositionPlayerNames[playerIndex] = `${number} - ${player.name}`;
        });
        
        // Apply substitutes (116-130)
        data.subs.forEach((player, index) => {
            const playerIndex = index + 116;
            const number = player.number ? `#${player.number}` : `#${playerIndex - 100}`;
            oppositionPlayerNames[playerIndex] = `${number} - ${player.name}`;
        });
    }
    
    // Update UI
    updatePlayerLabels();
    
    // Update Match Log team names and action button titles
    updateMatchLogTeamNames();
}

// Apply team design across the app
function applyTeamDesign(teamNumber, data) {
    const root = document.documentElement;
    
    // Helper function to convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    if (teamNumber === 1) {
        root.style.setProperty('--team1-primary', data.primaryColor);
        root.style.setProperty('--team1-secondary', data.secondaryColor);
        
        // Set RGB values for CSS rgba() usage
        const primaryRgb = hexToRgb(data.primaryColor);
        const secondaryRgb = hexToRgb(data.secondaryColor);
        if (primaryRgb) {
            root.style.setProperty('--team1-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
        }
        if (secondaryRgb) {
            root.style.setProperty('--team1-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
        }
    } else {
        root.style.setProperty('--team2-primary', data.primaryColor);
        root.style.setProperty('--team2-secondary', data.secondaryColor);
        
        // Set RGB values for CSS rgba() usage
        const primaryRgb = hexToRgb(data.primaryColor);
        const secondaryRgb = hexToRgb(data.secondaryColor);
        if (primaryRgb) {
            root.style.setProperty('--team2-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
        }
        if (secondaryRgb) {
            root.style.setProperty('--team2-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
        }
    }
    
    // Apply colors and patterns to team buttons
    const teamButtons = teamNumber === 1 ? 
        document.querySelectorAll('#our-team-view .player-button, #our-team-view button[id^="player-"]') :
        document.querySelectorAll('#opposition-view .player-button, #opposition-view button[id^="opp-player-"]');
    
    teamButtons.forEach(button => {
        applyButtonCustomization(button, data);
    });
    
    // Apply colors and patterns to Review tab filter pills
    const filterPill = document.getElementById(`filter-team-${teamNumber}-name`);
    if (filterPill) {
        console.log(`Applying team design to filter pill for team ${teamNumber}:`, data);
        applyButtonCustomization(filterPill, data);
    } else {
        console.log(`Filter pill not found for team ${teamNumber}`);
    }
    
    // Apply colors and patterns to Stats tab team pills
    const statsPill = document.getElementById(`stats-team-${teamNumber}-pill`);
    if (statsPill) {
        console.log(`Applying team design to stats pill for team ${teamNumber}:`, data);
        applyButtonCustomization(statsPill, data);
    } else {
        console.log(`Stats pill not found for team ${teamNumber}`);
    }
    
    // Update team toggle button text color for proper contrast
    const teamToggle = document.getElementById(`match-log-team-${teamNumber}-toggle`);
    if (teamToggle) {
        const textColor = getContrastColor(data.primaryColor);
        teamToggle.style.setProperty('color', textColor, 'important');
        console.log(`Updated team toggle text color for team ${teamNumber} to ${textColor}`);
    }
}

// Apply button customization based on team data
function applyButtonCustomization(button, data) {
    const primaryColor = data.primaryColor;
    const secondaryColor = data.secondaryColor;
    const pattern = data.pattern;
    
    console.log(`Applying customization to button:`, button.id, 'Colors:', primaryColor, secondaryColor, 'Pattern:', pattern);
    
    // Remove existing pattern classes to avoid conflicts with CSS
    button.classList.remove('pattern-classic', 'pattern-hooped', 'pattern-vertical', 'pattern-sash', 'pattern-diagonal', 'pattern-solid', 'pattern-custom', 'pattern-checkered', 'pattern-horizontal');
    
    // Don't add pattern classes - use pure inline styles to avoid CSS conflicts
    
    // Apply colors and patterns directly via inline styles (higher specificity than CSS classes)
    let backgroundStyle = '';
    let borderStyle = '';
    
    switch (pattern) {
        case 'solid':
            backgroundStyle = `background: ${primaryColor} !important;`;
            borderStyle = `border: 2px solid ${primaryColor} !important;`;
            break;
        case 'diagonal':
            backgroundStyle = `background: linear-gradient(45deg, ${primaryColor} 50%, ${secondaryColor} 50%) !important;`;
            borderStyle = `border: 2px solid ${primaryColor} !important;`;
            break;
        case 'checkered':
            backgroundStyle = `background: conic-gradient(${primaryColor} 90deg, ${secondaryColor} 90deg 180deg, ${primaryColor} 180deg 270deg, ${secondaryColor} 270deg) !important;`;
            borderStyle = `border: 2px solid ${primaryColor} !important;`;
            break;
        case 'hooped':
            backgroundStyle = `background: repeating-linear-gradient(0deg, ${primaryColor} 0px, ${primaryColor} 4px, ${secondaryColor} 4px, ${secondaryColor} 7px) !important;`;
            borderStyle = `border: 2px solid ${primaryColor} !important;`;
            break;
        case 'vertical':
            backgroundStyle = `background: repeating-linear-gradient(90deg, ${primaryColor} 0px, ${primaryColor} 6px, ${secondaryColor} 6px, ${secondaryColor} 10px) !important;`;
            borderStyle = `border: 2px solid ${primaryColor} !important;`;
            break;
        case 'horizontal':
            backgroundStyle = `background: repeating-linear-gradient(0deg, ${primaryColor} 0px, ${primaryColor} 4px, ${secondaryColor} 4px, ${secondaryColor} 7px) !important;`;
            borderStyle = `border: 2px solid ${primaryColor} !important;`;
            break;
        case 'sash':
            backgroundStyle = `background: linear-gradient(135deg, ${primaryColor} 40%, ${secondaryColor} 40%, ${secondaryColor} 60%, ${primaryColor} 60%) !important;`;
            borderStyle = `border: 2px solid ${primaryColor} !important;`;
            break;
        case 'classic':
            backgroundStyle = `background: ${primaryColor} !important;`;
            borderStyle = `border: 2px solid ${secondaryColor} !important;`;
            break;
        case 'custom':
            backgroundStyle = `background: ${primaryColor} !important;`;
            borderStyle = `border: 2px solid ${primaryColor} !important;`;
            break;
        default:
            backgroundStyle = `background: ${primaryColor} !important;`;
            borderStyle = `border: 2px solid ${primaryColor} !important;`;
    }
    
    // Calculate proper text color for contrast
    const textColor = getContrastColor(primaryColor);
    
    // Apply styles with !important to override CSS
    const finalStyle = backgroundStyle + borderStyle + `color: ${textColor} !important;`;
    button.style.cssText = finalStyle;
    console.log(`Applied styles to ${button.id}:`, finalStyle);
}

// Save to localStorage
function saveTeamSheetToLocalStorage(teamNumber, data) {
    try {
        const key = `teamSheet.team${teamNumber}`;
        localStorage.setItem(key, JSON.stringify(data));
        
        // Add to import history
        const historyKey = `teamSheet.history.team${teamNumber}`;
        let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        history.unshift({
            timestamp: new Date().toISOString(),
            data: data
        });
        
        // Keep only last 5 entries
        history = history.slice(0, 5);
        localStorage.setItem(historyKey, JSON.stringify(history));
        
    } catch (error) {
        console.warn('Could not save to localStorage:', error);
    }
}

// Load from localStorage
function loadTeamSheetFromLocalStorage(teamNumber) {
    try {
        const key = `teamSheet.team${teamNumber}`;
        const data = localStorage.getItem(key);
        console.log(`Loading from localStorage key "${key}":`, data);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Could not load from localStorage:', error);
        return null;
    }
}

// Load and apply team designs on startup
function loadAndApplyTeamDesigns() {
    // Load Team 1 design
    const team1Data = loadTeamSheetFromLocalStorage(1);
    if (team1Data) {
        console.log('Loading Team 1 design:', team1Data);
        applyTeamDesign(1, team1Data);
    } else {
        console.log('No Team 1 design found in localStorage');
    }
    
    // Load Team 2 design
    const team2Data = loadTeamSheetFromLocalStorage(2);
    if (team2Data) {
        console.log('Loading Team 2 design:', team2Data);
        applyTeamDesign(2, team2Data);
    } else {
        console.log('No Team 2 design found in localStorage');
    }
}

// Test function to manually apply team colors to filter pills
function testFilterPillColors() {
    console.log('Testing filter pill colors...');
    
    // Test with some sample colors
    const testData1 = {
        primaryColor: '#ff0000', // Red
        secondaryColor: '#0000ff', // Blue
        pattern: 'diagonal'
    };
    
    const testData2 = {
        primaryColor: '#00ff00', // Green
        secondaryColor: '#ffff00', // Yellow
        pattern: 'solid'
    };
    
    // Apply test colors
    applyTeamDesign(1, testData1);
    applyTeamDesign(2, testData2);
    
    console.log('Test colors applied - check the filter pills!');
}

// Function to clear team designs and test with fresh data
function clearTeamDesigns() {
    console.log('Clearing team designs from localStorage...');
    localStorage.removeItem('teamSheet.team1');
    localStorage.removeItem('teamSheet.team2');
    console.log('Team designs cleared. Refresh the page to see default colors.');
}

// Function to manually refresh filter pills with current team data
function refreshFilterPills() {
    console.log('Refreshing filter pills with current team data...');
    
    // Load current team designs and apply them
    const team1Data = loadTeamSheetFromLocalStorage(1);
    if (team1Data) {
        applyTeamDesign(1, team1Data);
        console.log('Applied Team 1 design to filter pills');
    }
    
    const team2Data = loadTeamSheetFromLocalStorage(2);
    if (team2Data) {
        applyTeamDesign(2, team2Data);
        console.log('Applied Team 2 design to filter pills');
    }
}

// Function to handle collapsible filter groups
function toggleFilterGroup(groupName) {
    const targetGroup = document.querySelector(`[data-group="${groupName}"]`);
    const allGroups = document.querySelectorAll('.filter-group');
    
    if (!targetGroup) {
        console.error(`Filter group not found: ${groupName}`);
        return;
    }
    
    // Check if the target group is already expanded
    const isExpanded = targetGroup.classList.contains('expanded');
    
    // Close all groups first (accordion behavior)
    allGroups.forEach(group => {
        group.classList.remove('expanded');
    });
    
    // If the target group wasn't expanded, expand it
    if (!isExpanded) {
        targetGroup.classList.add('expanded');
    }
    
    console.log(`Filter group ${groupName} ${isExpanded ? 'collapsed' : 'expanded'}`);
}

// Function to handle filter visibility toggles
function toggleFilterVisibility(actionType, teamNumber) {
    console.log(`Toggling filter: ${actionType} for Team ${teamNumber}`);
    // Refresh the review tab to apply filter changes
    filterActions();
}

// Function to clear all filters
function clearAllFilters() {
    console.log('Clearing all filters...');
    
    // Get all filter checkboxes
    const filterCheckboxes = document.querySelectorAll('#review input[type="checkbox"]');
    
    // Uncheck all filter checkboxes
    filterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Collapse all filter groups
    const filterGroups = document.querySelectorAll('.filter-group');
    filterGroups.forEach(group => {
        group.classList.add('collapsed');
        const toggleIcon = group.querySelector('.group-toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = '▶';
        }
    });
    
    // Refresh the review tab to show all actions
    filterActions();
    
    console.log('All filters cleared and groups collapsed');
}


// Test function for Point-Score filtering
function testPointScoreFiltering() {
    console.log('Testing Point-Score filtering...');
    
    // Create test entries
    const testEntry1 = {
        action: 'Point - Score',
        team: 'Team 1',
        coordinates1: '(20, 60)',
        player: 'Test Player 1',
        timestamp: new Date().toISOString()
    };
    
    const testEntry2 = {
        action: 'Point - Score',
        team: 'Team 2', 
        coordinates1: '(60, 80)',
        player: 'Test Player 2',
        timestamp: new Date().toISOString()
    };
    
    // Add test entries to actions log
    actionsLog.push(testEntry1, testEntry2);
    
    console.log('Added test Point-Score entries:', testEntry1, testEntry2);
    console.log('Switch to Review tab and toggle filters to test functionality');
    
    // Switch to Review tab
    switchTab('review');
}

function testTeamIdentifierSystem() {
    console.log('Testing Team Identifier System...');
    
    // Test 1: Check if new entries have teamNumber
    const testEntry = {
        action: 'Test Action',
        team: 'Test Team',
        teamNumber: 1
    };
    
    const teamCode = getTeamFromAction(testEntry);
    console.log('Test 1 - teamNumber priority:', teamCode === 'team1' ? 'PASS' : 'FAIL');
    
    // Test 2: Check backward compatibility with old entries
    const oldEntry = {
        action: 'Old Action',
        team: 'Team 1'
        // No teamNumber field
    };
    
    const oldTeamCode = getTeamFromAction(oldEntry);
    console.log('Test 2 - backward compatibility:', oldTeamCode === 'team1' ? 'PASS' : 'FAIL');
    
    // Test 3: Check CSV export format
    const exportHeaders = ['Action', 'Add_1', 'Add_2', 'Team', 'Team_Number', 'Player_1', 'Player_2', 'X1', 'Y1', 'X2', 'Y2', 'Notes'];
    console.log('Test 3 - CSV headers include Team_Number:', exportHeaders.includes('Team_Number') ? 'PASS' : 'FAIL');
    
    console.log('Team Identifier System tests completed.');
}

function updateStatsTab() {
    // Calculate total shots for each team
    const shotActions = ['Point - Score', '2-Point - Score', 'Goal - Score', 'Point - Miss', 'Goal - Miss'];
    
    let team1Shots = 0;
    let team2Shots = 0;
    
    // Calculate scores for each team (only scoring actions)
    const scoreActions = ['Point - Score', '2-Point - Score', 'Goal - Score'];
    let team1GoalScore = 0, team1TwoPointScore = 0, team1PointScore = 0;
    let team2GoalScore = 0, team2TwoPointScore = 0, team2PointScore = 0;
    
    actionsLog.forEach(entry => {
        if (shotActions.includes(entry.action)) {
            const teamCode = getTeamFromAction(entry);
            if (teamCode === 'team1') {
                team1Shots++;
            } else if (teamCode === 'team2') {
                team2Shots++;
            }
        }
        
        if (scoreActions.includes(entry.action)) {
            const teamCode = getTeamFromAction(entry);
            if (teamCode === 'team1') {
                if (entry.action === 'Goal - Score') team1GoalScore++;
                else if (entry.action === '2-Point - Score') team1TwoPointScore++;
                else if (entry.action === 'Point - Score') team1PointScore++;
            } else if (teamCode === 'team2') {
                if (entry.action === 'Goal - Score') team2GoalScore++;
                else if (entry.action === '2-Point - Score') team2TwoPointScore++;
                else if (entry.action === 'Point - Score') team2PointScore++;
            }
        }
    });
    
    // Update the display
    const team1ShotsElement = document.getElementById('stats-team-1-shots');
    const team2ShotsElement = document.getElementById('stats-team-2-shots');
    const team1ScoresElement = document.getElementById('stats-team-1-scores');
    const team2ScoresElement = document.getElementById('stats-team-2-scores');
    
    if (team1ShotsElement) {
        team1ShotsElement.textContent = team1Shots;
    }
    
    if (team2ShotsElement) {
        team2ShotsElement.textContent = team2Shots;
    }
    
    if (team1ScoresElement) {
        const team1TotalScores = team1GoalScore + team1TwoPointScore + team1PointScore;
        team1ScoresElement.textContent = `${team1TotalScores} (${team1GoalScore} - ${team1TwoPointScore} - ${team1PointScore})`;
    }
    
    if (team2ScoresElement) {
        const team2TotalScores = team2GoalScore + team2TwoPointScore + team2PointScore;
        team2ScoresElement.textContent = `${team2TotalScores} (${team2GoalScore} - ${team2TwoPointScore} - ${team2PointScore})`;
    }
    
    // Calculate and display shot conversion percentages
    const team1ConversionElement = document.getElementById('stats-team-1-conversion');
    const team2ConversionElement = document.getElementById('stats-team-2-conversion');
    
    if (team1ConversionElement) {
        const team1TotalScores = team1GoalScore + team1TwoPointScore + team1PointScore;
        const team1Conversion = team1Shots > 0 ? Math.round((team1TotalScores / team1Shots) * 100) : 0;
        team1ConversionElement.textContent = `${team1Conversion}%`;
    }
    
    if (team2ConversionElement) {
        const team2TotalScores = team2GoalScore + team2TwoPointScore + team2PointScore;
        const team2Conversion = team2Shots > 0 ? Math.round((team2TotalScores / team2Shots) * 100) : 0;
        team2ConversionElement.textContent = `${team2Conversion}%`;
    }
    
    // Calculate and display shots from attacks (shots / 45 entries)
    const team1ShotsFromAttacksElement = document.getElementById('stats-team-1-shots-from-attacks');
    const team2ShotsFromAttacksElement = document.getElementById('stats-team-2-shots-from-attacks');
    
    let team145Entries = 0;
    let team245Entries = 0;
    
    // Count 45 Entry actions for each team
    actionsLog.forEach(entry => {
        if (entry.action === '45 Entry') {
            if (entry.teamNumber === 1) {
                team145Entries++;
            } else if (entry.teamNumber === 2) {
                team245Entries++;
            }
        }
    });
    
    if (team1ShotsFromAttacksElement) {
        const team1ShotsFromAttacksPercentage = team145Entries > 0 ? Math.round((team1Shots / team145Entries) * 100) : 0;
        team1ShotsFromAttacksElement.textContent = `${team1Shots}/${team145Entries} (${team1ShotsFromAttacksPercentage}%)`;
    }
    
    if (team2ShotsFromAttacksElement) {
        const team2ShotsFromAttacksPercentage = team245Entries > 0 ? Math.round((team2Shots / team245Entries) * 100) : 0;
        team2ShotsFromAttacksElement.textContent = `${team2Shots}/${team245Entries} (${team2ShotsFromAttacksPercentage}%)`;
    }
    
    // Calculate and display scores from attacks (scores / 45 entries)
    const team1ScoresFromAttacksElement = document.getElementById('stats-team-1-scores-from-attacks');
    const team2ScoresFromAttacksElement = document.getElementById('stats-team-2-scores-from-attacks');
    
    if (team1ScoresFromAttacksElement) {
        const team1TotalScores = team1GoalScore + team1TwoPointScore + team1PointScore;
        const team1ScoresFromAttacksPercentage = team145Entries > 0 ? Math.round((team1TotalScores / team145Entries) * 100) : 0;
        team1ScoresFromAttacksElement.textContent = `${team1TotalScores}/${team145Entries} (${team1ScoresFromAttacksPercentage}%)`;
    }
    
    if (team2ScoresFromAttacksElement) {
        const team2TotalScores = team2GoalScore + team2TwoPointScore + team2PointScore;
        const team2ScoresFromAttacksPercentage = team245Entries > 0 ? Math.round((team2TotalScores / team245Entries) * 100) : 0;
        team2ScoresFromAttacksElement.textContent = `${team2TotalScores}/${team245Entries} (${team2ScoresFromAttacksPercentage}%)`;
    }
    
    // Calculate and display kickout counts
    const team1KickoutsElement = document.getElementById('stats-team-1-kickouts');
    const team2KickoutsElement = document.getElementById('stats-team-2-kickouts');
    
    let team1Kickouts = 0;
    let team2Kickouts = 0;
    let team1KickoutsWon = 0;
    let team2KickoutsWon = 0;
    let team1Uncontested = 0;
    let team2Uncontested = 0;
    let team1UncontestedWon = 0;
    let team2UncontestedWon = 0;
    let team1Contested = 0;
    let team2Contested = 0;
    let team1ContestedWon = 0;
    let team2ContestedWon = 0;
    
    actionsLog.forEach(entry => {
        if (entry.action === 'Our Kickout') {
            if (entry.teamNumber === 1) {
                team1Kickouts++;
                // Check if kickout was won (Screen 1 = Won Clean/Break/Sideline/Foul)
                if (entry.mode === 'Won Clean' || entry.mode === 'Won Break' || entry.mode === 'Won Sideline' || entry.mode === 'Won Foul') {
                    team1KickoutsWon++;
                }
                // Check if kickout was uncontested (Screen 2 = Uncontested)
                if (entry.definition === 'Uncontested') {
                    team1Uncontested++;
                    // Check if uncontested kickout was also won
                    if (entry.mode === 'Won Clean' || entry.mode === 'Won Break' || entry.mode === 'Won Sideline' || entry.mode === 'Won Foul') {
                        team1UncontestedWon++;
                    }
                }
                // Check if kickout was contested (Screen 2 = Contested)
                if (entry.definition === 'Contested') {
                    team1Contested++;
                    // Check if contested kickout was also won
                    if (entry.mode === 'Won Clean' || entry.mode === 'Won Break' || entry.mode === 'Won Sideline' || entry.mode === 'Won Foul') {
                        team1ContestedWon++;
                    }
                }
            }
        } else if (entry.action === 'Opp. Kickout') {
            if (entry.teamNumber === 2) {
                team2Kickouts++;
                // Check if kickout was won (Screen 1 = Won Clean/Break/Sideline/Foul)
                if (entry.mode === 'Won Clean' || entry.mode === 'Won Break' || entry.mode === 'Won Sideline' || entry.mode === 'Won Foul') {
                    team2KickoutsWon++;
                }
                // Check if kickout was uncontested (Screen 2 = Uncontested)
                if (entry.definition === 'Uncontested') {
                    team2Uncontested++;
                    // Check if uncontested kickout was also won
                    if (entry.mode === 'Won Clean' || entry.mode === 'Won Break' || entry.mode === 'Won Sideline' || entry.mode === 'Won Foul') {
                        team2UncontestedWon++;
                    }
                }
                // Check if kickout was contested (Screen 2 = Contested)
                if (entry.definition === 'Contested') {
                    team2Contested++;
                    // Check if contested kickout was also won
                    if (entry.mode === 'Won Clean' || entry.mode === 'Won Break' || entry.mode === 'Won Sideline' || entry.mode === 'Won Foul') {
                        team2ContestedWon++;
                    }
                }
            }
        }
    });
    
    if (team1KickoutsElement) {
        team1KickoutsElement.textContent = team1Kickouts;
    }
    
    if (team2KickoutsElement) {
        team2KickoutsElement.textContent = team2Kickouts;
    }
    
    // Calculate and display kickout win percentages
    const team1KickoutsWonElement = document.getElementById('stats-team-1-kickouts-won');
    const team2KickoutsWonElement = document.getElementById('stats-team-2-kickouts-won');
    
    if (team1KickoutsWonElement) {
        const team1WinPercentage = team1Kickouts > 0 ? Math.round((team1KickoutsWon / team1Kickouts) * 100) : 0;
        team1KickoutsWonElement.textContent = `${team1KickoutsWon}/${team1Kickouts} (${team1WinPercentage}% Won)`;
    }
    
    if (team2KickoutsWonElement) {
        const team2WinPercentage = team2Kickouts > 0 ? Math.round((team2KickoutsWon / team2Kickouts) * 100) : 0;
        team2KickoutsWonElement.textContent = `${team2KickoutsWon}/${team2Kickouts} (${team2WinPercentage}% Won)`;
    }
    
    // Calculate and display uncontested kickout win percentages
    const team1UncontestedElement = document.getElementById('stats-team-1-uncontested');
    const team2UncontestedElement = document.getElementById('stats-team-2-uncontested');
    
    if (team1UncontestedElement) {
        const team1UncontestedWinPercentage = team1Uncontested > 0 ? Math.round((team1UncontestedWon / team1Uncontested) * 100) : 0;
        team1UncontestedElement.textContent = `${team1UncontestedWon}/${team1Uncontested} (${team1UncontestedWinPercentage}% Won)`;
    }
    
    if (team2UncontestedElement) {
        const team2UncontestedWinPercentage = team2Uncontested > 0 ? Math.round((team2UncontestedWon / team2Uncontested) * 100) : 0;
        team2UncontestedElement.textContent = `${team2UncontestedWon}/${team2Uncontested} (${team2UncontestedWinPercentage}% Won)`;
    }
    
    // Calculate and display contested kickout win percentages
    const team1ContestedElement = document.getElementById('stats-team-1-contested');
    const team2ContestedElement = document.getElementById('stats-team-2-contested');
    
    if (team1ContestedElement) {
        const team1ContestedWinPercentage = team1Contested > 0 ? Math.round((team1ContestedWon / team1Contested) * 100) : 0;
        team1ContestedElement.textContent = `${team1ContestedWon}/${team1Contested} (${team1ContestedWinPercentage}% Won)`;
    }
    
    if (team2ContestedElement) {
        const team2ContestedWinPercentage = team2Contested > 0 ? Math.round((team2ContestedWon / team2Contested) * 100) : 0;
        team2ContestedElement.textContent = `${team2ContestedWon}/${team2Contested} (${team2ContestedWinPercentage}% Won)`;
    }
}

// Toggle stats group visibility
function toggleStatsGroup(groupName) {
    const content = document.getElementById(`${groupName}-content`);
    const toggle = document.getElementById(`${groupName}-toggle`);
    const header = document.querySelector(`[onclick="toggleStatsGroup('${groupName}')"]`);
    
    if (content && toggle && header) {
        const isCollapsed = content.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Expand - remove collapsed class
            content.classList.remove('collapsed');
            header.classList.add('expanded');
            toggle.textContent = '▼';
        } else {
            // Collapse - add collapsed class
            content.classList.add('collapsed');
            header.classList.remove('expanded');
            toggle.textContent = '▶';
        }
    }
}

// Show temporary message with type
function showTemporaryMessage(message, type = 'info') {
    // Create or get existing message element
    let messageEl = document.getElementById('temp-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'temp-message';
        messageEl.style.cssText = `
            position: fixed;
            top: 120px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            max-width: 90vw;
            text-align: center;
        `;
        document.body.appendChild(messageEl);
    }
    
    // Set background color based on type
    switch (type) {
        case 'success':
            messageEl.style.background = 'rgba(16, 185, 129, 0.95)';
            break;
        case 'error':
            messageEl.style.background = 'rgba(220, 38, 38, 0.95)';
            break;
        case 'warning':
            messageEl.style.background = 'rgba(245, 158, 11, 0.95)';
            break;
        default:
            messageEl.style.background = 'rgba(59, 130, 246, 0.95)';
    }
    
    messageEl.textContent = message;
    messageEl.style.opacity = '1';
    messageEl.style.transform = 'translateX(-50%) translateY(0)';
    
    // Hide after 4 seconds
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(-50%) translateY(-10px)';
    }, 4000);
}

// ===== PITCH PLOT SAVE FUNCTIONALITY =====

// Generate legend data based on visible filters
function generateLegend() {
    const visibleActions = [];
    
    // Define all possible action types with their display information
    const actionTypes = [
        { id: 'point-score', name: 'Point - Score', icon: 'pointScore', color: '#3b82f6' },
        { id: '2-point-score', name: '2-Point - Score', icon: 'twoPointScore', color: '#065f46' },
        { id: 'goal-score', name: 'Goal - Score', icon: 'goalScore', color: '#065f46' },
        { id: 'point-miss', name: 'Point - Miss', icon: 'pointMiss', color: '#dc2626' },
        { id: 'goal-miss', name: 'Goal - Miss', icon: 'goalMiss', color: '#dc2626' },
        { id: 'kickout', name: 'Kickout', icon: 'kickout', color: '#6b7280' },
        { id: 'free-won', name: 'Free Won', icon: 'freeWon', color: '#14b8a6' },
        { id: 'ball-lost-forced', name: 'Ball Lost (Forced)', icon: 'ballLostForced', color: '#ea580c' },
        { id: 'ball-lost-unforced', name: 'Ball Lost (Unforced)', icon: 'ballLostUnforced', color: '#ea580c' },
        { id: 'handpass', name: 'Handpass', icon: 'handpass', color: '#8b5cf6' },
        { id: 'kickpass', name: 'Kickpass', icon: 'kickpass', color: '#8b5cf6' },
        { id: 'carry', name: 'Carry', icon: 'carry', color: '#8b5cf6' },
        { id: 'ball-won-forced', name: 'Ball Won (Forced)', icon: 'ballWonForced', color: '#1e40af' },
        { id: 'ball-won-unforced', name: 'Ball Won (Unforced)', icon: 'ballWonUnforced', color: '#1e40af' },
        { id: 'foul-committed', name: 'Foul Committed', icon: 'foulCommitted', color: '#581c87' }
    ];
    
    actionTypes.forEach(action => {
        // Check if either team has this action type visible
        const team1Checked = document.getElementById(`filter-${action.id}-team1`)?.checked || false;
        const team2Checked = document.getElementById(`filter-${action.id}-team2`)?.checked || false;
        
        if (team1Checked || team2Checked) {
            visibleActions.push({
                ...action,
                team1Visible: team1Checked,
                team2Visible: team2Checked
            });
        }
    });
    
    return visibleActions;
}

// Draw legend icons for the saved image
function drawLegendIcon(ctx, x, y, size, action) {
    ctx.save();
    
    // Set up drawing parameters based on action type
    switch(action.icon) {
        case 'pointScore':
            ctx.fillStyle = action.color;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'twoPointScore':
        case 'goalScore':
            ctx.fillStyle = action.color;
            ctx.fillRect(x, y, size, size);
            break;
        case 'pointMiss':
        case 'goalMiss':
            ctx.strokeStyle = action.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'kickout':
            ctx.fillStyle = 'white';
            ctx.strokeStyle = action.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'freeWon':
            ctx.fillStyle = action.color;
            ctx.beginPath();
            ctx.moveTo(x + size/2, y);
            ctx.lineTo(x, y + size);
            ctx.lineTo(x + size, y + size);
            ctx.closePath();
            ctx.fill();
            break;
        case 'ballLostForced':
        case 'ballLostUnforced':
            ctx.strokeStyle = action.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y + size);
            ctx.moveTo(x + size, y);
            ctx.lineTo(x, y + size);
            ctx.stroke();
            break;
        case 'handpass':
        case 'kickpass':
        case 'carry':
            ctx.fillStyle = action.color;
            ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
            break;
        case 'ballWonForced':
        case 'ballWonUnforced':
            ctx.fillStyle = action.color;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            break;
        case 'foulCommitted':
            ctx.fillStyle = action.color;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('F', x + size/2, y + size/2 + 3);
            break;
        default:
            ctx.fillStyle = '#666666';
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.fill();
    }
    
    ctx.restore();
}

// Draw the legend on the final canvas
function drawLegend(ctx, visibleActions, startX, startY, legendWidth) {
    const lineHeight = 25;
    const iconSize = 15;
    let currentY = startY + 60; // Start below the title
    
    // Legend title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Legend', startX, currentY);
    currentY += 30;
    
    // Draw a separator line
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, currentY - 10);
    ctx.lineTo(startX + legendWidth - 20, currentY - 10);
    ctx.stroke();
    
    visibleActions.forEach(action => {
        // Draw action icon
        drawLegendIcon(ctx, startX, currentY, iconSize, action);
        
        // Draw action name
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.fillText(action.name, startX + iconSize + 10, currentY + 5);
        
        // Draw team indicators if applicable
        if (action.team1Visible && action.team2Visible) {
            ctx.fillStyle = '#666666';
            ctx.font = '10px Arial';
            ctx.fillText('(Both Teams)', startX + iconSize + 10, currentY + 15);
        } else if (action.team1Visible) {
            ctx.fillStyle = '#3b82f6'; // Team 1 color
            ctx.font = '10px Arial';
            ctx.fillText('(Team 1)', startX + iconSize + 10, currentY + 15);
        } else if (action.team2Visible) {
            ctx.fillStyle = '#ef4444'; // Team 2 color
            ctx.font = '10px Arial';
            ctx.fillText('(Team 2)', startX + iconSize + 10, currentY + 15);
        }
        
        currentY += lineHeight;
    });
}

// Main function to save the pitch plot as an image
function savePitchPlot() {
    try {
        // Get the canvas and its context
        const canvas = document.getElementById('review-pitch');
        if (!canvas) {
            console.error('Review pitch canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Create a new canvas for the final image (pitch + legend)
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        
        // Set dimensions for the final canvas
        const pitchWidth = canvas.width;
        const pitchHeight = canvas.height;
        const legendWidth = 220; // Width for legend
        const padding = 20;
        const titleHeight = 80; // Space for title and timestamp
        
        finalCanvas.width = pitchWidth + legendWidth + (padding * 3);
        finalCanvas.height = Math.max(pitchHeight, titleHeight + 300) + (padding * 2);
        
        // Fill background with white
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        // Draw the pitch on the left side
        finalCtx.drawImage(canvas, padding, padding + titleHeight);
        
        // Generate legend data
        const visibleActions = generateLegend();
        
        // Add title and metadata
        finalCtx.fillStyle = '#000000';
        finalCtx.font = 'bold 18px Arial';
        finalCtx.textAlign = 'center';
        finalCtx.fillText('GAA Match Analysis', finalCanvas.width / 2, 30);
        
        // Add team names if available
        const team1Name = document.getElementById('filter-team-1-name')?.textContent || 'Team 1';
        const team2Name = document.getElementById('filter-team-2-name')?.textContent || 'Team 2';
        finalCtx.font = '14px Arial';
        finalCtx.fillText(`${team1Name} vs ${team2Name}`, finalCanvas.width / 2, 50);
        
        // Add timestamp
        finalCtx.font = '12px Arial';
        finalCtx.fillText(`Generated: ${new Date().toLocaleString()}`, finalCanvas.width / 2, 70);
        
        // Draw legend if there are visible actions
        if (visibleActions.length > 0) {
            drawLegend(finalCtx, visibleActions, pitchWidth + (padding * 2), padding + titleHeight, legendWidth);
        } else {
            // Show message if no actions are visible
            finalCtx.fillStyle = '#666666';
            finalCtx.font = '14px Arial';
            finalCtx.textAlign = 'left';
            finalCtx.fillText('No actions visible - use filters to show action types', 
                            pitchWidth + (padding * 2), padding + titleHeight + 60);
        }
        
        // Convert to blob and download
        finalCanvas.toBlob(function(blob) {
            if (!blob) {
                console.error('Failed to create image blob');
                return;
            }
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Create filename with current date
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
            a.download = `gaa-pitch-analysis-${dateStr}-${timeStr}.png`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show success message
            showNotification('Pitch plot saved successfully!');
            
        }, 'image/png', 1.0); // High quality PNG
        
    } catch (error) {
        console.error('Error saving pitch plot:', error);
        showNotification('Error saving pitch plot. Please try again.', 'error');
    }
}
