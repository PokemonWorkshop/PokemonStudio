import { jsonMember, jsonObject, TypedJSON } from 'typedjson';

/**
 * This class represents the model of project studio (project.studio file)
 */
@jsonObject
export default class ProjectStudioModel {
  /**
   * The title of the project
   */
  @jsonMember(String)
  title!: string;

  /**
   * The version of the Pokémon Studio
   */
  @jsonMember(String)
  studioVersion!: string;

  /**
   * The icon of the project
   */
  @jsonMember(String)
  iconPath!: string;

  /**
   * Create a projet studio object (for project.studio file)
   * @param title The title of the projet
   * @param studioVersion The version of the Pokémon Studio
   * @param iconPath The icon of the project
   * @returns The new project studio object
   */
  static createProjectStudio = (title: string, studioVersion: string, iconPath: string) => {
    const newProjectStudio = new ProjectStudioModel();
    Object.assign(newProjectStudio, { title: title, studioVersion: studioVersion, iconPath: iconPath });
    return newProjectStudio;
  };

  /**
   * Clone the object
   */
  clone = (): ProjectStudioModel => {
    const newObject = new TypedJSON(ProjectStudioModel).parse(JSON.stringify(this));
    if (!newObject) throw new Error('Could not clone object');

    return newObject;
  };
}
