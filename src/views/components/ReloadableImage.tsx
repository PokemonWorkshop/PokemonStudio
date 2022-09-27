import React from 'react';
import { pathToFileURL } from 'url';

/** With this function, react can reload an image when the content of a file change,
 * see https://stackoverflow.com/questions/47922687/force-react-to-reload-an-image-file
 * for more information.
 */
function img2URL(path: string): string {
  return `${pathToFileURL(path).href}?${Date.now()}`;
}

interface ReloadableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const ReloadableImage: React.FC<ReloadableImageProps> = (props) => {
  return <img {...props} src={img2URL(props.src)} />;
};
