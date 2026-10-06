# Pokémon Studio development team workflow

> [!NOTE]
> Make sure to read the [README](README.md) file to know how to install the repository.

## Visual Management as an Organizational Principle

From the beginning of development, we have always chosen to organize ourselves using the principles of **visual management**.

In simple terms, it's a way **to make information concrete, readable, understandable, and memorable for all team members**. Everyone has access to the same level of information, and decision-making in the team is facilitated.

In the context of a volunteer project, where each contributor is free to organize themselves, it's an excellent way to facilitate access to information and reduce the number of unnecessary meetings.

Here's a list of elements that help facilitate this visual management:

- A task list using **GitHub Project** called [Backlog](https://github.com/users/PokemonWorkshop/projects/1) which gathers all the elements useful for software development. Needs, priorities, technical details. The goal is to understand at a glance what needs to be done and why. The "how" depends only on the development team.
- Clear, detailed, and simple processes.

### About the GitHub Project organization

The task list is organized using less principle for more efficiency:

- A [Backlog](https://github.com/users/PokemonWorkshop/projects/1/views/1) view to make sure everything is listed in one place
- A [Sprints](https://github.com/users/PokemonWorkshop/projects/1/views/2) view to display every sprint backlogs
- A [Bugs](https://github.com/orgs/PokemonWorkshop/projects/1/views/6) view to display all bugs and their status
- A [Good first issues](https://github.com/users/PokemonWorkshop/projects/1/views/10) view to display all issues that are suitable for new contributors
- A [Version 3 Backlog](https://github.com/orgs/PokemonWorkshop/projects/1/views/8) view to display all tasks related to the next major version of Pokémon Studio

## Project organization

We follow a project methodology called _Scrumban_, adapted to the project's context. It blends the principles of [Scrum](https://www.scrum.org/learning-series/what-is-scrum) and [Kanban](https://www.ionos.fr/digitalguide/sites-internet/developpement-web/kanban/) frameworks:

- Development is paced by periods of one month, called [Sprints](https://github.com/users/PokemonWorkshop/projects/1/views/2) or Iterations.
- Each iteration is introduced by a sprint goal, to lead the team to fulfill it and focus as best as possible.
- We reduce superfluous work and streamline as much as possible with a number of tasks chosen by each contributor based on their availability.

## About Figma organization

We're using [Figma](https://www.figma.com/) as a software to create our Design System and our User Interfaces (UI).

As a **collaborative software**, it is a powerful tool to work as a team and make sure everything is clear enough before starting development.

[Access the Pokémon Studio Figma](https://www.figma.com/file/xglOHHLb96zfPMTXd3v8i9/Pok%C3%A9mon-Studio)

> [!NOTE]
> The Pokémon Studio Figma is in view only access. Only UI Designers are authorized to edit them. Please make sure to contact Walven or Aerun if you're interested in collaborating on UI Design purposes.

## Discord organization

We're using Discord to communicate and make our vocal meetings:

- **One meeting per month** which group Sprint review and Sprint planning events.
- Only team contributors can participate in those meetings for now _but we're thinking about making those public_.
- If you want to join the team, please make sure to contact Walven or Aerun on Discord.

[Access the Pokémon Workshop Discord](https://discord.gg/0noB0gBDd91B8pMk)

## How to contribute

### For developers

If you want to contribute to the Pokémon Studio development, make sure to:

- Make sure to read the [README](README.md) to know how to install the repository,
- Check the [Backlog](https://github.com/users/PokemonWorkshop/projects/1/views/1) to know which tasks are planned and which ones are in a work in progress state,
- Access the [Code Guidelines](CodeGuidelines.md) to know them,
- Ask any question you want to the contributors.

### For testers

If you want to contribute to the Pokémon Studio development by testing new features, make sure to:

- Make sure to read the [README](README.md) to know how to install the repository,
- Check the [Pull Requests](https://github.com/PokemonWorkshop/PokemonStudio/pulls) that are opened to know which ones can be tested,
- Read the Pull Requests to know what is the purpose and what need to be tested,
- Ask any question you want to the contributors.

#### Once a test has been done

- Go to the `Files changed` tab and click `Review changes.`
- Write a comment depending on the success of the test: Comment, Approve or Request changes.

## How to make suggestions

You can [join our Discord](https://discord.gg/0noB0gBDd91B8pMk) to make suggestions about the Pokémon Studio development.
Please make sure to create a post in the [studio-suggestions](https://discord.com/channels/143824995867557888/1019954233900007464) chanel.

## Changelog requirements

Every pull request merged into `develop` must be classified for the next release changelog.

### Changelog entry

Pull request authors must write one short sentence between the following markers in the pull request description:

```html
<!-- changelog:start -->
Describe the functional change here.
<!-- changelog:end -->
```

The entry must:

- be written in English US
- describe the functional effect for makers or players
- use clear and concise language
- avoid implementation details unless they are relevant to users
- only describe behavior that is actually included in the pull request.

Examples:

```txt
Add a command that waits for movement to finish.
Fix a crash when quickly opening a type page.
Show the selected filename in icon fields.
```

Avoid entries such as:

```txt
Refactor the condition registry architecture.
Update several React components.
Change the internal JSON serialization method.
```

When a pull request does not contain a user-facing change, leave the entry empty and ask a maintainer to apply the `changelog:skip` label.

### Changelog labels

Before merge, every pull request must have exactly one of the following labels:

- `changelog:addition` - introduces a new user-facing feature or capability
- `changelog:update` - changes or improves existing behavior or functionality
- `changelog:fix` - fixes incorrect user-facing behavior
- `changelog:skip` - contains no user-facing changelog entry.

A pull request must never have multiple category labels.

The optional `changelog:notready` label places the entry in the section dedicated to unfinished features that are not ready for production use. It does not replace a category label.

For example, an unfinished new feature must have both:

- `changelog:addition`
- `changelog:notready`.

Contributors who cannot manage labels are not expected to add them themselves. The reviewer or maintainer must apply the appropriate labels before merging the pull request. In case of doubt, the reviewer should ask a maintainer for guidance.

### Review responsibility

Before approving or merging a pull request, reviewers must verify that:

- the changelog entry matches the actual functional change
- the entry does not promise behavior that is not implemented
- exactly one changelog category label is present
- `changelog:notready` is present when the change is unavailable in the production version
- an empty entry is only accepted with `changelog:skip`.

> [!WARNING]
> Missing or conflicting changelog metadata can prevent the next release notes from being generated.
