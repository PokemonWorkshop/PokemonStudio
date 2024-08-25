import { TypeCategory } from '@components/categories';
import { CopyIdentifier } from '@components/Copy';
import { ResourceImage } from '@components/ResourceImage';
import { useGlobalState } from '@src/GlobalStateProvider';
import { getNameType } from '@utils/getNameType';
import { padStr } from '@utils/PadStr';
import { pokemonSpritePath } from '@utils/path';
import {
  useGetEntityDescriptionText,
  useGetEntityNameText,
  useGetCreatureFormDescriptionText,
  useGetCreatureFormNameText,
} from '@utils/ReadingProjectText';
import React from 'react';
import {
  DataBlockContainer,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderBadges,
  DataInfoContainerHeaderTitle,
  DataSpriteContainer,
} from '../dataBlocks';
import { PokemonDataProps } from './PokemonDataPropsInterface';
import styled from 'styled-components';

const CreatureNameContainer = styled.div`
  display: flex;
  flex-direction: column;

  .specie {
    ${({ theme }) => theme.fonts.normalMedium}
    font-size: 20px;
    color: ${({ theme }) => theme.colors.text400};
  }
`;

export const PokemonFrame = ({ pokemonWithForm, dialogsRef }: PokemonDataProps) => {
  const { species, form } = pokemonWithForm;
  const [state] = useGlobalState();
  const getCreatureName = useGetEntityNameText();
  const getCreatureFormName = useGetCreatureFormNameText();
  const getCreatureDescription = useGetEntityDescriptionText();
  const getCreatureFormDescription = useGetCreatureFormDescriptionText();
  const types = state.projectData.types;
  const creatureName = species ? getCreatureName(species) : '';
  const creatureFormName = form ? getCreatureFormName(form) : '';

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef.current?.openDialog('information')}>
      <DataGrid columns="160px minmax(min-content, 610px) auto">
        <DataSpriteContainer type="sprite">
          <ResourceImage imagePathInProject={pokemonSpritePath(form)} />
        </DataSpriteContainer>
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <CreatureNameContainer>
              {creatureName !== creatureFormName && <span className="specie">{creatureName}</span>}
              <DataInfoContainerHeaderTitle>
                <h1>
                  {creatureFormName}
                  <span className="data-id">#{padStr(species?.id, 3)}</span>
                </h1>
                <CopyIdentifier dataToCopy={species.dbSymbol} />
              </DataInfoContainerHeaderTitle>
            </CreatureNameContainer>
            <DataInfoContainerHeaderBadges>
              <TypeCategory type={form.type1}>{getNameType(types, form.type1, state)}</TypeCategory>
              {form.type2 !== '__undef__' && <TypeCategory type={form.type2}>{getNameType(types, form.type2, state)}</TypeCategory>}
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
          <p>{form.form === 0 ? getCreatureDescription(species) : getCreatureFormDescription(form)}</p>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
