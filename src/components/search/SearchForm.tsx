"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  flattenAutocompleteSuggestions,
  type SearchAutocompleteResult,
  type SearchAutocompleteSuggestion,
} from "@/lib/search-types";
import { SearchAutocompleteList } from "./SearchAutocompleteList";

const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const MIN_AUTOCOMPLETE_LENGTH = 2;

type SearchFormProps = {
  autoFocus?: boolean;
  defaultQuery?: string;
  onSubmit?: () => void;
  className?: string;
  inputClassName?: string;
  compact?: boolean;
  enableAutocomplete?: boolean;
};

async function fetchAutocomplete(
  query: string,
  signal: AbortSignal
): Promise<SearchAutocompleteResult> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/search/autocomplete?${params.toString()}`, {
    signal,
  });
  const data = (await response.json()) as SearchAutocompleteResult & {
    error?: string;
  };

  if (!response.ok) {
    return { products: [], categories: [] };
  }

  return {
    products: data.products ?? [],
    categories: data.categories ?? [],
  };
}

export function SearchForm({
  autoFocus = false,
  defaultQuery = "",
  onSubmit,
  className = "",
  inputClassName = "",
  compact = false,
  enableAutocomplete = true,
}: SearchFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [value, setValue] = useState(defaultQuery);
  const [suggestions, setSuggestions] = useState<SearchAutocompleteResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setValue(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    if (!enableAutocomplete) return;

    const trimmed = value.trim();
    if (trimmed.length < MIN_AUTOCOMPLETE_LENGTH) {
      setSuggestions(null);
      setLoading(false);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setOpen(true);

      fetchAutocomplete(trimmed, controller.signal)
        .then((result) => {
          setSuggestions(result);
          setActiveIndex(-1);
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") return;
          setSuggestions({ products: [], categories: [] });
        })
        .finally(() => {
          setLoading(false);
        });
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [value, enableAutocomplete]);

  const navigateToSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onSubmit?.();
    setOpen(false);
    // Hard navigation — router.push is unreliable on iOS Safari 16 form submit.
    window.location.assign(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const navigateToSuggestion = (suggestion: SearchAutocompleteSuggestion) => {
    onSubmit?.();
    setOpen(false);
    window.location.assign(suggestion.href);
  };

  const flatSuggestions = suggestions
    ? flattenAutocompleteSuggestions(suggestions)
    : [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeIndex >= 0 && flatSuggestions[activeIndex]) {
      navigateToSuggestion(flatSuggestions[activeIndex]);
      return;
    }
    navigateToSearch(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!enableAutocomplete || !open) {
      if (event.key === "Escape") {
        setOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        index < flatSuggestions.length - 1 ? index + 1 : index
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index > 0 ? index - 1 : -1));
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
  };

  return (
    <form
      action="/search"
      method="get"
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      role="search"
    >
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => {
            if (value.trim().length >= MIN_AUTOCOMPLETE_LENGTH) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              setActiveIndex(-1);
            }, 150);
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          enterKeyHint="search"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-expanded={open}
          placeholder="Кольцо, серьги, артикул…"
          className={`min-w-0 flex-1 rounded-lg border border-brand-olive/20 bg-white px-4 text-base text-brand-text placeholder:text-brand-muted focus:border-brand-olive focus:outline-none focus:ring-2 focus:ring-brand-olive/20 ${
            compact ? "py-2" : "py-2.5"
          } ${inputClassName}`}
        />
        <button
          type="submit"
          className={`shrink-0 rounded-lg bg-brand-terracotta px-4 font-medium text-white transition-colors hover:bg-brand-terracotta-logo ${
            compact ? "py-2 text-sm" : "py-2.5 text-base"
          }`}
        >
          Найти
        </button>
      </div>

      {enableAutocomplete ? (
        <SearchAutocompleteList
          query={value.trim()}
          result={suggestions}
          loading={loading}
          open={open}
          activeIndex={activeIndex}
          listId={listId}
          onSelect={navigateToSuggestion}
          onShowAll={() => navigateToSearch(value)}
        />
      ) : null}
    </form>
  );
}
