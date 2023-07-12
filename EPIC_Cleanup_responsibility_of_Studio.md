# [EPIC] Cleanup responsibility of Studio pages

Currently Studio pages handle too much things, this lead to a lot of boiler plate code which makes maintaining them very complicated.

In this EPIC we'll aim to make the Studio pages as simple as possible.

## What does Studio pages do?

Studio page does the following thing:

1. Get the project data info & utility
2. Define the ControlBar navigation function
3. Create the Edited entity
4. Create the CTRL+Thing navigation
5. Create the editor state
6. Create the translation state
7. Create the deletion state
8. Define the editor close behaviors
9. Define the delete action behaviors
10. Define the list of editors to display
11. Show the page

Technically step 1 and 11 are the only required steps.

## What are user expected to do with a Studio page? [Reminder]

If we look at the page structure we have three main parts:

- The control bar
- The data display
- The action display

The control bar is responsive of allowing the user Choose what to see or create a new entity / sub entity.

The data display is responsive of showing data to the user and let user edit that data if he clicks on the corresponding data box.

The action display let's the user do some action like see additional information, go to specific editors or delete the entity.

If we sum this up, here's what  the user can do on a page:

1. Create a new entity
2. Choose which entity to see/edit
3. Edit a part of the entity
4. Delete the entity
5. Navigate to sub pages

For all of those actions, the components can technically know what to do thanks to the global state giving for instance the currently viewed entity.

## What can we do to simplify the Studio pages?

The most obvious answer to that is reducing the responsibility to only tell components what to show. We can have dedicated components for dedicated work.

We can take the ControlBar as example. All page control bar know how to show their data themselves, they technically don't need the Page to tell them how to change the current DbSymbol. We should then do that.

One additional information is that when showing a dialog (editor, deletion) we should only be able to show one at once (putting aside translation), this mean we can handle deletion & edition in the same component with a single state!

### The ideal Studio page

In this part I'll show an ideal Studio page based on the Move page:

```typescript
export const MovePage = () => {
  const { move, moveName, cannotDelete, dialogsRef } = useMovePage();
  const { t } = useTranslation('database_moves');
  const history = useHistory();
  const onClickedPokemonList = () => history.push(`/database/moves/pokemon`);

  return (
    <DatabasePageStyle>
      <MoveControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <MoveFrame move={move} dialogsRef={dialogsRef} />
            <DataDataBlock move={move} dialogsRef={dialogsRef} />
            <ParametersDataBlock move={move} dialogsRef={dialogsRef} />
            <CharacteristicsDataBlock move={move} dialogsRef={dialogsRef} />
            <StatusDataBlock move={move} dialogsRef={dialogsRef} />
            <StatisticsDataBlock move={move} dialogsRef={dialogsRef} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={`${t('pokemon_with_move')} ${moveName}`}>
              <DarkButton onClick={onClickedPokemonList}>{t('button_list_pokemon')}</DarkButton>
            </DataBlockWithAction>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonV2 type="move" disabled={cannotDelete} dialogsRef={dialogsRef} />
            </DataBlockWithAction>
          </DataBlockWrapper>
          <MoveEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
```

As you can see this version is a bit more welcoming since it shows only what's necessary. The biggest part of the logic has been moved to `useMovePage`. The variable `dialogsRef` is responsive of giving what's necessary to open any dialog (deletion + editor + translation).

Here's an example of what useMovePage could contain:

```typescript
export const useMovePage = () => {
  const dialogsRef = useDialogsRef<MoveEditorAndDeletionKeys>();
  const { projectDataValues: moves, selectedDataIdentifier: moveDbSymbol, state } = useProjectData('moves', 'move');
  const move = moves[moveDbSymbol];
  const moveName = getEntityNameText(move, state);

  return {
    move,
    moveName,
    dialogsRef,
    cannotDelete: Object.keys(moves).length <= 1,
  };
};
```

This hook is rather straight forward, this is mainly due to the fact that Navigation is responsibility of the ControlBar an not the page itself. If you see a control bar on the screen, you expect its controls to be CTRL+N, CTRL+LEFT, CTRL+RIGHT to do what it offers without having to click on it.

To make things a bit easier for the control bar, it should have a hook that takes as parameter the dialogsRef (to know if any editor is open) and what kind of previous/next navigation we use (name or id). This hook will return everything the controlBar needs to work. We'll not detail it in this document.

### Where are the editor definition?

In this new code structure, the editor & deletion definition is now handled by `MoveEditorOverlay`, the translation part is also handled by this component. Ideally we should use the html dialog element through a React Portal.

The main advantage of dialogs is that they're meant to take away control of the page so the browser focus in the currently opened editor. For more information read those two pages:

- [The dialog tag on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog#accessibility_considerations)
- [How to animate dialogs](https://codepen.io/geckotang/post/dialog-with-animation)

You might have seen in the previous chapter that `useDialogsRef` takes a `MoveEditorAndDeletionKeys` type. This is defined by the `MoveEditorOverlay` file.

This time, to avoid useless rendering of dialogs we will use a render function with a switch case over the `MoveEditorAndDeletionKeys` this way we only render the useful editor in the dialog :)

For now I don't have any examples to show since I did not implement stuff with dialog yet but the global idea is:

1. Have a ref for the previous opened editor (defaulting to the "new" editor)
2. Have a state for the currently opened editor (defaulting to undefined)
3. Have a ref to a useEditorHandlingCloseRef()
4. Have a ref for the dialog tag so we can call the open/close functions. 
5. Produce the `useDialogsRef` which exposes the `openDialog` function, `closeDialog` function and currently opened editor value.
6. Have a memo for the currently opened editor element. (the editor itself can read the state and know when the dbSymbol changed).
7. Figure out about the translations
8. Render the dialog to the portal.

With this structure, the dialogs are all responsive of consuming / mutating the global state as they need to. They can close themselves using the dialogsRef and they can tell `MoveEditorOverlay` if they can be closed with escape or outside press based on the `useEditorHandlingCloseRef()`.
