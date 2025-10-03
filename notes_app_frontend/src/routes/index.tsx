import {
  $,
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import styles from "./index.css?inline";

/**
 * PUBLIC_INTERFACE
 * Home route rendering the Ocean Professional themed screen, adapted from static assets.
 * Interactive behaviors:
 * - Sidebar toggle on narrow screens
 * - "/" keyboard shortcut to focus search
 * - Button ripple on primary action
 */
export default component$(() => {
  useStyles$(styles);

  // Reactive UI state
  const sidebarOpen = useSignal(false);
  const searchRef = useSignal<HTMLInputElement>();
  const newNoteBtnRef = useSignal<HTMLButtonElement>();
  const fabRef = useSignal<HTMLButtonElement>();

  // Toggle sidebar state
  const toggleSidebar$ = $(() => {
    sidebarOpen.value = !sidebarOpen.value;
  });

  // Create note placeholder action
  const createNote$ = $(() => {
    // Placeholder for integration with future routes/actions
    // eslint-disable-next-line no-console
    console.log("Create new note");
  });

  // Keyboard shortcut: "/" focuses search when not typing in inputs
  useVisibleTask$(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toUpperCase();
      const isTyping =
        activeTag === "INPUT" ||
        activeTag === "TEXTAREA" ||
        activeTag === "SELECT";
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        const input = searchRef.value;
        if (input) {
          input.focus();
          const val = input.value;
          input.value = "";
          input.value = val;
        }
      }
      if (e.key === "Escape" && sidebarOpen.value) {
        sidebarOpen.value = false;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  // Button ripple effect using CSS background-size animation on a child element
  useVisibleTask$(() => {
    const installRipple = (btn: HTMLButtonElement | undefined | null) => {
      if (!btn) return;
      const ripple = btn.querySelector<HTMLSpanElement>(".btn-ripple");
      if (!ripple) return;
      const handler = (e: PointerEvent) => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ripple.style.backgroundPosition = `${x}px ${y}px`;
        ripple.style.backgroundSize = "0 0";
        // force reflow
        ripple.getBoundingClientRect();
        ripple.style.backgroundSize = `${size * 2}px ${size * 2}px`;
        // reset after animation
        window.setTimeout(() => {
          ripple.style.backgroundSize = "0 0";
        }, 450);
      };
      btn.addEventListener("pointerdown", handler, { passive: true });
      return () => btn.removeEventListener("pointerdown", handler as any);
    };

    const cleanups: Array<(() => void) | void> = [];
    cleanups.push(installRipple(newNoteBtnRef.value));
    cleanups.push(installRipple(fabRef.value));
    return () => {
      cleanups.forEach((c) => c && c());
    };
  });

  // Close sidebar when clicking outside (only when open)
  useVisibleTask$(({ track }) => {
    track(() => sidebarOpen.value);
    if (!sidebarOpen.value) return;
    const onClick = (e: MouseEvent) => {
      const sidebarEl = document.getElementById("sidebar");
      const toggleEl = document.querySelector(".menu-toggle");
      const path = (e.composedPath && e.composedPath()) || [];
      if (
        sidebarEl &&
        !path.includes(sidebarEl) &&
        toggleEl &&
        !path.includes(toggleEl)
      ) {
        sidebarOpen.value = false;
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  });

  return (
    <div class="app-shell">
      {/* Header */}
      <header class="app-header" role="banner">
        <button
          class="icon-btn menu-toggle"
          aria-label="Toggle sidebar"
          aria-controls="sidebar"
          aria-expanded={sidebarOpen.value ? "true" : "false"}
          onClick$={toggleSidebar$}
        >
          <svg class="icon icon-24" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
            />
          </svg>
        </button>

        <h1 class="brand">
          <span class="brand-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="icon icon-24">
              <path
                fill="currentColor"
                d="M12 2l4 4h-3v6h-2V6H8l4-4zm-7 9h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9z"
              />
            </svg>
          </span>
          NoteEase
        </h1>

        <div class="header-actions" role="toolbar" aria-label="Header actions">
          <div class="search-wrap" role="search">
            <svg
              class="icon icon-20 search-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 9.5 16a6.47 6.47 0 0 0 4.23-1.57l.27.28h.79L20 19.5 21.5 18 15.5 14Zm-6 0C7 14 5 12 5 9.5S7 5 9.5 5 14 7 14 9.5 12 14 9.5 14Z"
              />
            </svg>
            <input
              id="search"
              ref={searchRef}
              class="search-input"
              type="search"
              placeholder="Search notes…"
              aria-label="Search notes"
            />
          </div>
          <button
            class="btn primary new-note"
            id="new-note-btn"
            ref={newNoteBtnRef}
            aria-label="Create new note"
            onClick$={createNote$}
          >
            <span class="btn-ripple" aria-hidden="true"></span>
            <svg class="icon icon-20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6z"
              />
            </svg>
            <span class="btn-text">New Note</span>
          </button>
        </div>
      </header>

      {/* Layout */}
      <div class={["app-layout"].join(" ")}>
        {/* Sidebar */}
        <aside
          id="sidebar"
          class={["sidebar", sidebarOpen.value ? "is-open" : ""].join(" ")}
          aria-label="Note categories"
        >
          <nav class="sidebar-nav" aria-label="Categories">
            <h2 class="sidebar-title">Categories</h2>
            <ul class="category-list" role="list">
              <li>
                <button class="category-item is-active" aria-current="page">
                  All Notes
                </button>
              </li>
              <li>
                <button class="category-item">Work</button>
              </li>
              <li>
                <button class="category-item">Personal</button>
              </li>
              <li>
                <button class="category-item">Ideas</button>
              </li>
              <li>
                <button class="category-item">Archive</button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <main class="main" role="main">
          <section aria-labelledby="notes-heading" class="notes-section">
            <h2 id="notes-heading" class="visually-hidden">
              Notes
            </h2>

            <div class="notes-grid">
              {/* Demo note cards from assets for visual parity */}
              {[
                {
                  t:
                    "Book Review: The Design of Everyday Things by Don Norman",
                  e:
                    "Key insights on affordances, feedback, and user-centered design principles that improve everyday interactions…",
                  tags: ["Books", "UX"],
                  updated: "Updated 2d ago",
                  dt: "2025-07-18T10:00:00Z",
                },
                {
                  t: "Animes produced by Ufotable",
                  e:
                    "Studio highlights including Demon Slayer, Fate series, and distinctive visual direction and compositing…",
                  tags: ["Anime", "Media"],
                  updated: "Updated 1h ago",
                  dt: "2025-07-20T16:00:00Z",
                },
                {
                  t: "Mangas planned to read",
                  e:
                    "Queue: Vagabond, Pluto, Oyasumi Punpun, Monster, Chainsaw Man, and must-read classics…",
                  tags: ["Manga", "Reading"],
                  updated: "Updated 3d ago",
                  dt: "2025-07-17T08:00:00Z",
                },
                {
                  t: "Awesome tweets collection",
                  e:
                    "Curated threads on engineering, product, and design—saved for quick reference and inspiration…",
                  tags: ["Social", "Curation"],
                  updated: "Updated 5h ago",
                  dt: "2025-07-20T12:00:00Z",
                },
                {
                  t: "List of free & open source apps",
                  e:
                    "Top FOSS picks across categories: productivity, graphics, development, utilities, and privacy tools…",
                  tags: ["FOSS", "Tools"],
                  updated: "Updated 1d ago",
                  dt: "2025-07-19T09:00:00Z",
                },
                {
                  t: "Research ideas",
                  e:
                    "Hypotheses around offline-first sync models, CRDT performance, and end-to-end encryption patterns…",
                  tags: ["Ideas", "Research"],
                  updated: "Updated 4h ago",
                  dt: "2025-07-20T13:00:00Z",
                },
                {
                  t: "Personal goals",
                  e:
                    "Focus on consistency, health, and deep work; set weekly tracking with measurable milestones…",
                  tags: ["Personal"],
                  updated: "Updated 6d ago",
                  dt: "2025-07-14T10:00:00Z",
                },
              ].map((n) => (
                <article
                  key={n.t}
                  class="note-card"
                  tabIndex={0}
                  aria-label={`${n.t}, ${n.updated.toLowerCase()}`}
                >
                  <header class="note-header">
                    <h3 class="note-title">{n.t}</h3>
                  </header>
                  <p class="note-excerpt">{n.e}</p>
                  <footer class="note-meta">
                    <ul class="tags" aria-label="Tags">
                      {n.tags.map((tg) => (
                        <li key={tg} class="tag">
                          {tg}
                        </li>
                      ))}
                    </ul>
                    <time class="updated" dateTime={n.dt}>
                      {n.updated}
                    </time>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        class="fab"
        aria-label="Create new note (floating)"
        data-fab
        ref={fabRef}
        onClick$={createNote$}
      >
        <svg class="icon icon-24" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6z" />
        </svg>
      </button>
    </div>
  );
});

export const head: DocumentHead = {
  title: "NoteEase — Home",
  meta: [
    {
      name: "description",
      content:
        "NoteEase — Fast, modern notes with a clean Ocean Professional design.",
    },
    { name: "color-scheme", content: "light" },
  ],
};
