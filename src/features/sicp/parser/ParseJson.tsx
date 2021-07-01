import { Blockquote, Code, H1, OL, Pre, UL } from '@blueprintjs/core';
import React from 'react';
import { Link } from 'react-router-dom';
import Constants from 'src/commons/utils/Constants';
import SicpExercise from 'src/pages/sicp/subcomponents/SicpExercise';
import SicpLatex from 'src/pages/sicp/subcomponents/SicpLatex';

import CodeSnippet from '../../../pages/sicp/subcomponents/CodeSnippet';

// Custom error class for errors when parsing JSON files.
export class ParseJsonError extends Error {}

/**
 * Functions to handle parsing of JSON files into JSX elements.
 */
export type JsonType = {
  child?: Array<JsonType>;
  tag?: string;
  body?: string;
  output?: string;
  scale?: string;
  snippet?: JsonType;
  table?: JsonType;
  images?: Array<JsonType>;
  src?: string;
  captionHref?: string;
  captionName?: string;
  captionBody?: Array<JsonType>;
  latex?: boolean;
  author?: string;
  date?: string;
  title?: string;
  solution?: Array<JsonType>;
  id?: string;
  program?: string;
  href?: string;
  count?: integer;
  eval?: boolean;
  prependLength?: number;
};

const handleFootnote = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <>
      {obj['count'] === 1 && <hr />}
      <div className="sicp-footnote">
        <div ref={ref => (refs.current[obj['id']!] = ref)} />
        <a href={obj['href']}>{'[' + obj['count'] + '] '}</a>
        {parseArr(obj['child']!, refs)}
      </div>
    </>
  );
};

const handleRef = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <Link ref={ref => (refs.current[obj['id']!] = ref)} to={obj['href']!}>
      {obj['body']}
    </Link>
  );
};

const handleEpigraph = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  const { child, author, title, date } = obj;

  const hasAttribution = author || title || date;

  const attribution = [];
  attribution.push(<React.Fragment key="attribution">-</React.Fragment>);

  if (author) {
    attribution.push(<React.Fragment key="author">{author}</React.Fragment>);
  }

  if (title) {
    attribution.push(<i key="title">{title}</i>);
  }

  if (date) {
    attribution.push(<React.Fragment key="date">{date}</React.Fragment>);
  }

  const text = child && parseArr(child!, refs);

  return text ? (
    <Blockquote className="sicp-epigraph">
      {text}
      {hasAttribution && <div className="sicp-attribution">{attribution}</div>}
    </Blockquote>
  ) : (
    <>{hasAttribution && <div className="sicp-attribution">{attribution}</div>}</>
  );
};

const handleSnippet = (obj: JsonType) => {
  if (obj['latex']) {
    return <Pre>{handleLatex(obj['body']!)}</Pre>;
  } else if (typeof obj['eval'] === 'boolean' && !obj['eval']) {
    return <Pre>{obj['body']}</Pre>;
  } else {
    if (!obj['body']) {
      return;
    }

    const CodeSnippetProps = {
      body: obj['body']!,
      id: obj['id']!,
      initialEditorValueHash: obj['program']!,
      prependLength: obj['prependLength']!,
      output: obj['output']!
    };
    return <CodeSnippet {...CodeSnippetProps} />;
  }
};

const handleFigure = (obj: JsonType, refs: React.MutableRefObject<{}>) => (
  <div className="sicp-figure">
    <div ref={ref => (refs.current[obj['id']!] = ref)} />
    {handleImage(obj, refs)}
    {obj['captionName'] && (
      <h5 className="sicp-caption">
        {obj['captionName']}
        {parseArr(obj['captionBody']!, refs)}
      </h5>
    )}
  </div>
);

const handleImage = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  if (obj['src']) {
    return (
      <img
        src={Constants.interactiveSicpDataUrl + obj['src']}
        alt={obj['id']}
        width={obj['scale'] || '100%'}
      />
    );
  } else if (obj['snippet']) {
    return processingFunctions['SNIPPET'](obj['snippet'], refs);
  } else if (obj['table']) {
    return processingFunctions['TABLE'](obj['table'], refs);
  } else {
    throw new ParseJsonError('Figure has no image');
  }
};

const handleTR = (obj: JsonType, refs: React.MutableRefObject<{}>, index: integer) => {
  return <tr key={index}>{obj['child']!.map((x, index) => handleTD(x, refs, index))}</tr>;
};

const handleTD = (obj: JsonType, refs: React.MutableRefObject<{}>, index: integer) => {
  return <td key={index}>{parseArr(obj['child']!, refs)}</td>;
};

const handleExercise = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <div>
      <div ref={ref => (refs.current[obj['id']!] = ref)} />
      <SicpExercise
        title={obj['title']!}
        body={parseArr(obj['child']!, refs)}
        solution={obj['solution'] && parseArr(obj['solution'], refs)}
      />
    </div>
  );
};

const handleContainer = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <div>
      {obj['body'] && <H1>{obj['body']!}</H1>}
      <div>{parseArr(obj['child']!, refs)}</div>
    </div>
  );
};

const handleReference = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return <div className="sicp-reference">{parseArr(obj['child']!, refs)}</div>;
};

const handleText = (text: string) => {
  return <>{text}</>;
};

const handleLatex = (math: string) => {
  return <SicpLatex math={math} />;
};

export const processingFunctions = {
  '#text': (obj: JsonType, _refs: React.MutableRefObject<{}>) => handleText(obj['body']!),

  B: (obj: JsonType, refs: React.MutableRefObject<{}>) => <b>{parseArr(obj['child']!, refs)}</b>,

  BR: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => <br />,

  CHAPTER: handleContainer,

  DISPLAYFOOTNOTE: handleFootnote,

  EM: (obj: JsonType, refs: React.MutableRefObject<{}>) => <em>{parseArr(obj['child']!, refs)}</em>,

  EPIGRAPH: handleEpigraph,

  EXERCISE: handleExercise,

  FIGURE: handleFigure,

  FOOTNOTE_REF: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <sup>{handleRef(obj, refs)}</sup>
  ),

  JAVASCRIPTINLINE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => (
    <Code>{obj['body']}</Code>
  ),

  LATEX: (obj: JsonType, _refs: React.MutableRefObject<{}>) => handleLatex(obj['body']!),

  LI: (obj: JsonType, refs: React.MutableRefObject<{}>) => <li>{parseArr(obj['child']!, refs)}</li>,

  LINK: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <a href={obj['href']}>{obj['body']}</a>
  ),

  META: (obj: JsonType, _refs: React.MutableRefObject<{}>) => <em>{obj['body']}</em>,

  OL: (obj: JsonType, refs: React.MutableRefObject<{}>) => <OL>{parseArr(obj['child']!, refs)}</OL>,

  REF: handleRef,

  REFERENCE: handleReference,

  SECTION: handleContainer,

  SNIPPET: (obj: JsonType, _refs: React.MutableRefObject<{}>) => handleSnippet(obj),

  SUBHEADING: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <h2 className="bp3-heading" ref={ref => (refs.current[obj['id']!] = ref)}>
      {parseArr(obj['child']!, refs)}
    </h2>
  ),

  SUBSUBHEADING: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <h4 className="bp3-heading" ref={ref => (refs.current[obj['id']!] = ref)}>
      <br />
      {parseArr(obj['child']!, refs)}
    </h4>
  ),

  TABLE: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <table>
      <tbody>{obj['child']!.map((x, index) => handleTR(x, refs, index))}</tbody>
    </table>
  ),

  TEXT: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <>
      <div className="sicp-text">
        <div ref={ref => (refs.current[obj['id']!] = ref)} />
        {parseArr(obj['child']!, refs)}
      </div>
      <br />
    </>
  ),

  TT: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <Code>{parseArr(obj['child']!, refs)}</Code>
  ),

  UL: (obj: JsonType, refs: React.MutableRefObject<{}>) => <UL>{parseArr(obj['child']!, refs)}</UL>
};

// Parse array of objects. An array of objects represent sibling nodes.
export const parseArr = (arr: Array<JsonType>, refs: React.MutableRefObject<{}>) => {
  if (!arr) {
    return <></>;
  }

  return <>{arr.map((item, index) => parseObj(item, index, refs))}</>;
};

// Parse an object.
export const parseObj = (
  obj: JsonType,
  index: number | undefined,
  refs: React.MutableRefObject<{}>
) => {
  if (obj['tag']) {
    if (processingFunctions[obj['tag']]) {
      return (
        <React.Fragment key={index}>{processingFunctions[obj['tag']](obj, refs)}</React.Fragment>
      );
    } else {
      throw new ParseJsonError('Unrecognised Tag: ' + obj['tag']);
    }
  } else {
    // Handle case where tag does not exists. Should not happen if json file is created properly.
    return <React.Fragment key={index}>{parseArr(obj['child']!, refs)}</React.Fragment>;
  }
};
