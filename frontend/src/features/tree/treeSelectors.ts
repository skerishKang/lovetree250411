import { RootState } from '@/store';

export const selectTreeNodes = (state: RootState) => state.tree.nodes;
export const selectSelectedNode = (state: RootState) => state.tree.selectedNode;
export const selectTreeLoading = (state: RootState) => state.tree.loading;
export const selectTreeError = (state: RootState) => state.tree.error; 