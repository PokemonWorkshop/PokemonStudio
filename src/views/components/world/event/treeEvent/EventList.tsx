import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useProjectEvents } from '@hooks/useProjectData';
import { useSelectOptions } from '@hooks/useSelectOptions';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AutoSizer, List } from 'react-virtualized';
import styled from 'styled-components';

const EventListContainer = styled.div`
  height: calc(100vh - 291px);
  margin-top: 4px;

  & .scrollable-view {
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.dark12};
      opacity: 0.8;
      box-sizing: border-box;
      border: 1px solid ${({ theme }) => theme.colors.text500};
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: ${({ theme }) => theme.colors.dark15};
      border-color: ${({ theme }) => theme.colors.text400};
    }

    .event,
    .event-selected {
      display: flex;
      height: 35px;
      padding: 0px 8px;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
      color: ${({ theme }) => theme.colors.text100};
      box-sizing: border-box;

      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        ${({ theme }) => theme.fonts.normalRegular}
      }

      .icon {
        display: flex;
        height: 18px;
        width: 18px;
        align-items: center;
        justify-content: center;
      }

      .point-icon {
        width: 2px;
        height: 2px;
        background-color: ${({ theme }) => theme.colors.text400};
        border-radius: 100%;
      }

      :hover {
        background-color: ${({ theme }) => theme.colors.dark18};
        cursor: pointer;
      }
    }

    .event-selected {
      background-color: ${({ theme }) => theme.colors.dark20};

      :hover {
        background-color: ${({ theme }) => theme.colors.dark20};
      }
    }
  }

  .no-events {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
    padding: 9.5px 15px;
  }
`;

const filter = (options: SelectOption[], research: string) => {
  if (research === '') return options;

  const researchLowerCase = research.toLowerCase();
  return options.filter((option) => option.label.toLowerCase().indexOf(researchLowerCase) !== -1);
};

type EventListProps = {
  research: string;
};

export const EventList = ({ research }: EventListProps) => {
  const { selectedDataIdentifier: currentEvent, setSelectedDataIdentifier: setCurrentEvent } = useProjectEvents();
  const { t } = useTranslation();
  const options = useSelectOptions('events');
  const optionsFiltered = useMemo(() => filter(options, research), [options, research]);

  return (
    <EventListContainer>
      {optionsFiltered.length !== 0 ? (
        <AutoSizer>
          {({ width, height }) => {
            return (
              <List
                className="scrollable-view"
                width={width}
                height={height}
                rowHeight={39}
                rowCount={optionsFiltered.length}
                rowRenderer={({ key, index, style }) => {
                  const option = optionsFiltered[index];
                  return (
                    <div
                      className={currentEvent === option.value ? 'event-selected' : 'event'}
                      key={`${option.value}-${key}`}
                      onClick={() => setCurrentEvent({ event: option.value })}
                      style={{ ...style, height: '35px' }}
                    >
                      <span className="icon">
                        <span className="point-icon" />
                      </span>
                      <span className="name">{option.label}</span>
                    </div>
                  );
                }}
                tabIndex={null}
              />
            );
          }}
        </AutoSizer>
      ) : (
        <div className="no-events">{t('no_event_found')}</div>
      )}
    </EventListContainer>
  );
};
