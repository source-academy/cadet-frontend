import {
  AnchorButton,
  Button,
  Classes,
  Dialog,
  InputGroup,
  Intent,
  ITreeNode,
  Tree
} from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import {
  checkIfFileCanBeOpened,
  checkIfFileCanBeSavedAndGetSaveType,
  checkIfUserAgreesToOverwriteEditorData,
  checkIfUserAgreesToPerformCreatingSave,
  checkIfUserAgreesToPerformOverwritingSave,
  openFileInEditor,
  performCreatingSave,
  performOverwritingSave
} from '../../features/github/GitHubUtils';
import { GitHubFileNodeData } from './GitHubFileNodeData';
import { GitHubTreeNodeCreator } from './GitHubTreeNodeCreator';

const FileExplorerDialog: React.FC<any> = props => {
  const [refresh, setRefresh] = useState(0);

  const [repoFiles, setRepoFiles] = useState([] as ITreeNode<GitHubFileNodeData>[]);
  const [filePath, setFilePath] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  let githubLoginID: string;
  let githubName: string;
  let githubEmail: string;

  getUserDetails();

  useEffect(() => {
    setFirstLayerRepoFiles(props.repoName, setRepoFiles); // this is an async call
  }, [props.repoName]);

  return (
    <Dialog className="githubDialog" isOpen={true} onClose={handleClose}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>Select a File</h3>
      </div>
      <div className={Classes.DIALOG_BODY}>
        <Tree
          contents={repoFiles}
          onNodeClick={handleNodeClick}
          onNodeCollapse={handleNodeCollapse}
          onNodeExpand={handleNodeExpand}
          className={classNames('FileTree', Classes.ELEVATION_0)}
        />
        {props.pickerType === 'Save' && (
          <div>
            <InputGroup
              id="FileNameTextBox"
              onChange={handleFileNameChange}
              onClick={handleClickFileNameBox}
              placeholder={'Enter File Name'}
              value={filePath}
            />
            <InputGroup
              onChange={handleCommitMessageChange}
              placeholder={'Enter Commit Message'}
              value={commitMessage}
            />
          </div>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={handleClose}>Close</Button>
          <AnchorButton onClick={handleSubmit} intent={Intent.PRIMARY} text={props.pickerType} />
        </div>
      </div>
    </Dialog>
  );

  async function getUserDetails() {
    const authUser = await props.octokit.users.getAuthenticated();
    githubLoginID = authUser.data.login;
    githubName = authUser.data.name || 'Source Academy User';
    githubEmail = authUser.data.email || 'no public email provided';
  }

  async function setFirstLayerRepoFiles(repoName: string, setRepoFiles: any) {
    try {
      const initialRepoFiles = await GitHubTreeNodeCreator.getFirstLayerRepoFileNodes(repoName);
      setRepoFiles(initialRepoFiles);
    } catch (err) {
      console.error(err);
    }
  }

  function handleClose() {
    props.onSubmit('');
  }

  async function handleSubmit() {
    if (props.pickerType === 'Open') {
      if (await checkIfFileCanBeOpened(props.octokit, githubLoginID, props.repoName, filePath)) {
        if (await checkIfUserAgreesToOverwriteEditorData()) {
          openFileInEditor(props.octokit, githubLoginID, props.repoName, filePath);
        }
      }
    }

    if (props.pickerType === 'Save') {
      const { canBeSaved, saveType } = await checkIfFileCanBeSavedAndGetSaveType(
        props.octokit,
        githubLoginID,
        props.repoName,
        filePath
      );

      if (canBeSaved) {
        if (saveType === 'Overwrite' && (await checkIfUserAgreesToPerformOverwritingSave())) {
          performOverwritingSave(
            props.octokit,
            githubLoginID,
            props.repoName,
            filePath,
            githubName,
            githubEmail,
            commitMessage
          );
        }

        if (saveType === 'Create' && (await checkIfUserAgreesToPerformCreatingSave())) {
          performCreatingSave(
            props.octokit,
            githubLoginID,
            props.repoName,
            filePath,
            githubName,
            githubEmail,
            commitMessage
          );
        }
      }
    }
  }

  function handleNodeClick(
    treeNode: ITreeNode<GitHubFileNodeData>,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>
  ) {
    const originallySelected = treeNode.isSelected;

    if (!e.shiftKey) {
      forEachNode(repoFiles, n => (n.isSelected = false));
    }

    treeNode.isSelected = originallySelected == null ? true : !originallySelected;
    const newFilePath = treeNode.nodeData !== undefined ? treeNode.nodeData.filePath : '';
    if (treeNode.isSelected) {
      setFilePath(newFilePath);
    } else {
      setFilePath('');
    }
    refreshPage();
  }

  function handleNodeCollapse(treeNode: ITreeNode<GitHubFileNodeData>) {
    treeNode.isExpanded = false;
    refreshPage();
  }

  async function handleNodeExpand(treeNode: ITreeNode<GitHubFileNodeData>) {
    treeNode.isExpanded = true;

    if (treeNode.nodeData !== undefined && !treeNode.nodeData.childrenRetrieved) {
      treeNode.childNodes = await GitHubTreeNodeCreator.getChildNodes(
        props.repoName,
        treeNode.nodeData.filePath
      );
      treeNode.nodeData.childrenRetrieved = true;
    }
    refreshPage();
  }

  function forEachNode(
    treeNodes: ITreeNode<GitHubFileNodeData>[],
    callback: (node: ITreeNode<GitHubFileNodeData>) => void
  ) {
    if (treeNodes == null) {
      return;
    }

    for (const node of treeNodes) {
      callback(node);
      if (node.childNodes !== undefined) {
        forEachNode(node.childNodes, callback);
      }
    }
  }

  function handleFileNameChange(e: any) {
    setFilePath(e.target.value);
  }

  function handleCommitMessageChange(e: any) {
    setCommitMessage(e.target.value);
  }

  function handleClickFileNameBox(e: any) {
    if (filePath === '') {
      setFilePath('.js');
    }
  }

  function refreshPage() {
    setRefresh(refresh + 1);
  }
};

export default FileExplorerDialog;
