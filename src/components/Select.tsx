import clsx from 'clsx';
import Fuse from 'fuse.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AutoSize from 'react-input-autosize';

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
  const [filterValue, setFilterValue] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = useMemo(() => {
    if (!filterValue) {
      return options;
    }
    return new Fuse(options, {
      keys: ['label'],
      isCaseSensitive: true,
      shouldSort: false,
    })
      .search(filterValue)
      .map((result) => result.item);
  }, [filterValue, options]);

  function clearOptions() {
    multiple ? onChange([]) : onChange(undefined);
  }

  function clearInput() {
    setFilterValue('');
  }

  const selectOption = useCallback(
    (option: SelectOption) => {
      if (!multiple) {
        if (option !== value) {
          onChange(option);
          clearInput();
        }
        return;
      }
      if (value.includes(option)) {
        onChange(value.filter((val) => val !== option));
        clearInput();
        return;
      }
      onChange([...value, option]);
      clearInput();
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

  useEffect(() => {
    const input = inputRef.current;
    const handler = (event: KeyboardEvent) => {
      if (event.target !== input) {
        return;
      }
      switch (event.code) {
        case 'Space':
        case 'Enter':
          setIsOpen((prev) => !prev);
          if (isOpen) selectOption(filteredOptions[highlightedIndex]);
          break;
        case 'ArrowDown':
        case 'ArrowUp': {
          if (!isOpen) {
            setIsOpen(true);
            break;
          }
          let newValue =
            highlightedIndex + (event.code === 'ArrowDown' ? 1 : -1);
          if (newValue < 0) {
            newValue = filteredOptions.length - 1;
          }
          if (newValue > filteredOptions.length - 1) {
            newValue = 0;
          }
          setHighlightedIndex(newValue);
          break;
        }
        case 'Escape':
          setIsOpen(false);
          break;
        default:
          return;
      }
    };
    input?.addEventListener('keydown', handler);

    return () => {
      input?.removeEventListener('keydown', handler);
    };
  }, [isOpen, filteredOptions, highlightedIndex, selectOption]);

  useEffect(() => {
    const container = containerRef.current;
    const focusHandler = (e: Event) => {
      const target = e.target as Element;
      if (!container?.contains(target)) {
        setIsOpen(false);
      }
    };
    const clickOutSideHandler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!container?.contains(target)) {
        setIsOpen(false);
        return;
      }
    };
    document.addEventListener('click', clickOutSideHandler);
    document.addEventListener('focusin', focusHandler);

    return () => {
      document.removeEventListener('click', clickOutSideHandler);
      document.removeEventListener('focusin', focusHandler);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        onClick={() => {
          inputRef?.current?.focus();
        }}
        className={styles.container}
      >
        <div className={styles['value-container']}>
          {multiple ? (
            value.map((val) => {
              return (
                <button
                  className={styles['option-badge']}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOption(val);
                  }}
                  key={val.value}
                >
                  {val.label}{' '}
                  <span className={styles['remove-btn']}>&times;</span>
                </button>
              );
            })
          ) : (
            <>
              <AutoSize
                value={filterValue}
                onFocus={() => {
                  setIsOpen(true);
                }}
                onBlur={() => {
                  setFilterValue('');
                }}
                inputRef={(input) => {
                  inputRef.current = input;
                }}
                inputStyle={{
                  padding: 0,
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                onChange={(e) => {
                  setIsOpen(true);
                  setFilterValue(e.target.value);
                }}
              />
              {(!filterValue && value?.label) || <>&nbsp;</>}
            </>
          )}
        </div>
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
          {filteredOptions.map((option, index) => (
            <li
              onMouseEnter={() => {
                setHighlightedIndex(index);
              }}
              onClick={(e) => {
                inputRef?.current?.focus();
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
    </>
  );
};
