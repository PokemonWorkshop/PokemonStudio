import styled from 'styled-components';

export const PokemonFrameStyle = styled.div`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 24px;
  width: 1024px;
  border: 1px solid;
  border-color: ${(props) => props.theme.colors.dark20};
  border-radius: 12px;
  gap: 24px;

  .pokemon-side-container {
    width: 160px;
    height: 160px;

    img {
      width: 100%;
      image-rendering: pixelated;
    }
  }

  #pokemon-info {
    display: flex;
    flex-direction: column;
    gap: 24px;

    #info-title {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      gap: 12px;

      #id {
        color: ${(props) => props.theme.colors.text400};
        font-family: 'Avenir Next';
        font-size: 20px;
      }
    }

    #info-description {
      margin: 0;
      font-size: 14px;
      color: ${(props) => props.theme.colors.text100};
    }
  }
`;
