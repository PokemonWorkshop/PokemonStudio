import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ResourceImage } from '@components/ResourceImage';
import { Dim, Row, SearchInput } from './styles';

/**
 * Searchable Graphics/Pictures file list with a thumbnail preview, for Show
 * Picture (231). RMXP stores the BARE name (no extension); the `project://`
 * image protocol resolves the .png/.gif, so the list needs only bare names.
 */

const List = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.dark18};
  flex: 1;
`;

const Item = styled.button<{ $selected: boolean }>`
  padding: 5px 8px;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  ${({ theme, $selected }) => `
    background: ${$selected ? theme.colors.primaryBase : 'transparent'};
    color: ${$selected ? theme.colors.text100 : theme.colors.text400};
  `}
  &:hover {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.primaryBase : theme.colors.dark22)};
  }
`;

const Empty = styled.div`
  padding: 10px 8px;
  color: ${({ theme }) => theme.colors.text400};
`;

const Split = styled.div`
  display: flex;
  gap: 8px;
  align-items: stretch;
`;

const Thumb = styled.div`
  width: 128px;
  min-height: 128px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.dark12};
  overflow: hidden;

  & img {
    max-width: 100%;
    max-height: 200px;
    image-rendering: pixelated;
  }
`;

type Props = {
  files: string[];
  /** The BARE name chosen ('' = none). */
  value: string;
  onChange: (name: string) => void;
  /** Subfolder under graphics/ the thumbnail resolves against. Default 'pictures'. */
  folder?: string;
};

export const PicturePicker = ({ files, value, onChange, folder = 'pictures' }: Props) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? files.filter((f) => f.toLowerCase().includes(q)) : files;
  }, [files, search]);

  return (
    <>
      <Row>
        <SearchInput value={search} placeholder={t('me_events_pic_search')} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
      </Row>
      <Split>
        <List>
          {filtered.length === 0 ? (
            <Empty>{files.length === 0 ? t('me_events_pic_none') : t('me_events_pic_no_match')}</Empty>
          ) : (
            filtered.map((f) => (
              <Item key={f} type="button" $selected={f === value} onClick={() => onChange(f)}>
                {f}
              </Item>
            ))
          )}
          {/* A stored name whose file is gone stays selectable. */}
          {value !== '' && !files.includes(value) && (
            <Item type="button" $selected onClick={() => undefined}>
              {t('me_events_pic_missing', { name: value })}
            </Item>
          )}
        </List>
        <Thumb>
          {value ? <ResourceImage imagePathInProject={`graphics/${folder}/${value}`} /> : <Dim>{t('me_events_pic_none_selected')}</Dim>}
        </Thumb>
      </Split>
    </>
  );
};
