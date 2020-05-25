import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { Variant } from 'js-slang/dist/types';

import { ISourceLanguage, sourceLanguages, styliseChapter } from 'src/reducers/states'; // TODO: Import from commons

export type DefaultChapterProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleFetchChapter: () => void;
  handleUpdateChapter: (chapter: Chapter) => void;
  handleChapterSelect?: (i: Chapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export type StateProps = {
  sourceChapter: number;
  sourceVariant: Variant;
};

// TODO: Duplicate from EditingWorkspaceContent/DeploymentTab, AcademyDefaultChapterComponent, and ChapterSelect
type Chapter = {
  chapter: number;
  variant: Variant;
  displayName: string;
};

export function DefaultChapter(props: DefaultChapterProps) {
  props.handleFetchChapter();

  const chapters = sourceLanguages.map((lang: ISourceLanguage) => {
    return {
      chapter: lang.chapter,
      variant: lang.variant,
      displayName: styliseChapter(lang.chapter, lang.variant)
    };
  });

  const chapterRenderer: ItemRenderer<Chapter> = (lang, { handleClick }) => (
    <MenuItem
      active={false}
      key={lang.chapter + lang.variant}
      onClick={handleClick}
      text={lang.displayName}
    />
  );

  const ChapterSelectComponent = Select.ofType<Chapter>();

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
    handleSelect = (i: Chapter) => {}
  ) => (
    <ChapterSelectComponent
      className={Classes.MINIMAL}
      items={chapters}
      onItemSelect={handleSelect}
      itemRenderer={chapterRenderer}
      filterable={false}
    >
      <Button
        className={Classes.MINIMAL}
        text={styliseChapter(currentChap, currentVariant)}
        rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
      />
    </ChapterSelectComponent>
  );

  return (
    <div> {chapSelect(props.sourceChapter, props.sourceVariant, props.handleUpdateChapter)} </div>
  );
}
