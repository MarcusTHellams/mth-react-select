import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './select.module.css';

export type SelectOption = {
  label: string;
  value: string | number;
};

export type MultipleSelectProps = {
  multiple: true;
  onChange: (value: SelectOption[]) => void;
  value: SelectOption[];
};

export type SingleSelectProps = {
  multiple?: false;
  onChange: (value: SelectOption | undefined) => void;
  value?: SelectOption;
};

export type SelectProps = {
  options: SelectOption[];
} & (SingleSelectProps | MultipleSelectProps);

export const Select = (props: SelectProps) => {
  const { multiple, onChange, options, value } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  function clearOptions() {
    multiple ? onChange([]) : onChange(undefined);
  }
  const selectOption = useCallback(
    (option: SelectOption) => {
      if (!multiple) {
        if (option !== value) {
          onChange(option);
        }
        return;
      }
      if (value.includes(option)) {
        onChange(value.filter((val) => val !== option));
        return;
      }
      onChange([...value, option]);
    },
    [multiple, onChange, value]
  );

  function isOptionSelected(option: SelectOption) {
    return multiple ? value.includes(option) : value === option;
  }

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = containerRef.current;
    const handler = (event: KeyboardEvent) => {
      if (event.target !== div) {
        return;
      }
      switch (event.code) {
        case 'Space':
        case 'Enter':
          setIsOpen((prev) => !prev);
          if (isOpen) selectOption(options[highlightedIndex]);
          break;
        case 'ArrowDown':
        case 'ArrowUp': {
          if (!isOpen) {
            setIsOpen(true);
            break;
          }
          const newValue =
            highlightedIndex + (event.code === 'ArrowDown' ? 1 : -1);
          if (newValue >= 0 && newValue < options.length) {
            setHighlightedIndex(newValue);
          }
          break;
        }
        case 'Escape':
          setIsOpen(false);
          break;
        default:
          return;
      }
    };
    div?.addEventListener('keydown', handler);

    return () => {
      div?.removeEventListener('keydown', handler);
    };
  }, [isOpen, options, highlightedIndex, selectOption]);

  return (
    <div
      ref={containerRef}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen((prev) => !prev)}
      tabIndex={0}
      className={styles.container}
    >
      {/* prettier-ignore */}
      <span className={styles.value}>
        {multiple
          ? value.map((val) => {
            return <button className={styles['option-badge']} onClick={(e) => {
              e.stopPropagation();
              selectOption(val);
            }} key={val.value}>{val.label} <span className={styles['remove-btn']}>&times;</span></button>;
          })
          : value?.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          clearOptions();
        }}
        className={styles['clr-btn']}
      >
        &times;
      </button>
      <div className={styles.divider}></div>
      <div className={styles.caret}></div>
      <ul className={clsx(styles.options, isOpen && styles.show)}>
        {options.map((option, index) => (
          <li
            onMouseEnter={() => {
              setHighlightedIndex(index);
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectOption(option);
              setIsOpen(false);
            }}
            className={clsx(
              styles.option,
              isOptionSelected(option) && styles.selected,
              highlightedIndex === index && styles.highlighted
            )}
            key={option.value}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
