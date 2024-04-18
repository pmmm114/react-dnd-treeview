import React from "react";
import { Meta } from "@storybook/react";
import { expect } from "@storybook/jest";
import { within, fireEvent } from "@storybook/testing-library";
import { DndProvider, MultiBackend, getBackendOptions, Tree } from "~/index";
import { pageFactory } from "~/stories/pageFactory";
import * as argTypes from "~/stories/argTypes";
import { CustomDragPreview } from "./CustomDragPreview";
import { TreeProps, DragLayerMonitorProps } from "~/types";
import { FileProperties } from "~/stories/types";
import {
  dragEnterAndDragOver,
  dragLeaveAndDragEnd,
  getPointerCoords,
  assertElementCoords,
  wait,
} from "~/stories/examples/helpers";
import { CustomNode } from "~/stories/examples/components/CustomNode";
import { interactionsDisabled } from "~/stories/examples/interactionsDisabled";
import { DefaultTemplate } from "~/stories/examples/DefaultTemplate";
import sampleData from "~/stories/assets/sample-default.json";
import styles from "./DynamicClassName.module.css";

export default {
  component: Tree,
  title: "Basic Examples/Dynamic class name",
  argTypes,
  decorators: [
    (Story) => (
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <Story />
      </DndProvider>
    ),
  ],
} as Meta<TreeProps<FileProperties>>;

export const DynamicClassNameStory = DefaultTemplate.bind({});

DynamicClassNameStory.args = {
  rootId: 0,
  tree: sampleData,
  classes: {
    root: styles.treeRoot,
    draggingSource: styles.draggingSource,
    dropTarget: styles.dropTarget,
    listItem: (node, params) => {
      return node.data?.fileType ? styles[node.data.fileType] : "";
    },
  },
  initialOpen: true,
  render: function render(node, options) {
    return <CustomNode node={node} {...options} />;
  },
  dragPreviewRender: (monitorProps: DragLayerMonitorProps<FileProperties>) => (
    <CustomDragPreview monitorProps={monitorProps} />
  ),
};

DynamicClassNameStory.storyName = "Dynamic class name";

DynamicClassNameStory.parameters = {
  docs: {
    page: pageFactory({
      jsId: "dynamic-class-name-js-vskw43",
      tsId: "dynamic-class-name-ts-thrng9",
    }),
  },
};

if (!interactionsDisabled) {
  DynamicClassNameStory.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByTestId("custom-drag-preview")).toBeNull();

    // show preview during dragging
    const dragSource = canvas.getByText("File 3");
    const dropTarget = canvas.getByTestId("custom-node-1");

    await wait();

    fireEvent.dragStart(dragSource);

    const coords = getPointerCoords(dropTarget);
    await dragEnterAndDragOver(dropTarget, coords);

    expect(
      await canvas.findByTestId("custom-drag-preview")
    ).toBeInTheDocument();

    assertElementCoords(canvas.getByTestId("custom-drag-preview"), 32, 32);

    // hide preview when drag is canceled
    dragLeaveAndDragEnd(dragSource, dropTarget);

    await wait();

    expect(canvas.queryByTestId("custom-drag-preview")).toBeNull();
  };
}
