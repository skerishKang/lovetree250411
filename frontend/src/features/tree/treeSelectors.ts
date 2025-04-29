import { RootState } from '@/store';

export const selectTreeNodes = (state: RootState) => state.trees.nodes;
export const selectSelectedNode = (state: RootState) => state.trees.selectedNode;
export const selectTreeLoading = (state: RootState) => state.trees.loading;
export const selectTreeError = (state: RootState) => state.trees.error; 