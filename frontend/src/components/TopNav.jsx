import StreakBadge from "./StreakBadge.jsx";
import StreakCalendarPopover from "./StreakCalendarPopover.jsx";

export default function TopNav({ player, showControls, onHome, calendarOpen, onToggleCalendar, onCloseCalendar, history }) {
  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between px-5 sm:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-xl leading-none">🚩</span>
        <span className="font-display text-lg font-bold text-blush-800">Flag Check</span>
        {player && (
          <span className="ml-2 hidden truncate text-[11px] text-blush-400 sm:inline">
            reading as <span className="font-semibold text-blush-500">{player.username}</span>
          </span>
        )}
      </div>

      {showControls && player && (
        <div className="flex items-center gap-2">
          <button
            onClick={onHome}
            aria-label="Switch reader"
            title="Switch reader"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-blush-200 bg-white/80 text-blush-500 shadow-sm backdrop-blur transition hover:border-blush-300 hover:text-blush-600"
          >
            <HomeIcon />
          </button>

          <div className="relative">
            <StreakBadge streak={player.streak} open={calendarOpen} onClick={onToggleCalendar} />
            <StreakCalendarPopover
              open={calendarOpen}
              onClose={onCloseCalendar}
              history={history}
              currentStreak={player.streak}
              longestStreak={player.longestStreak}
            />
          </div>
        </div>
      )}
    </header>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 7.2 8 2l6 5.2M3.4 6.2V13a.8.8 0 0 0 .8.8H6.4v-4h3.2v4h2.2a.8.8 0 0 0 .8-.8V6.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}