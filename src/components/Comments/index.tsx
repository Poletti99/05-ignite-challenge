import { useEffect } from 'react';
import { useUtterances } from '../../hooks/useUtterances';

interface CommentsProps {
  id: string;
}

export function Comments({ id }: CommentsProps) {
  useUtterances(id);

  return <div id={id} />;
}
