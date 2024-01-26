import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isExpanded: false
};

export const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        toggleExpansion: (state) => {
            state.isExpanded = !state.isExpanded;
        },
        expand: (state) => {
            state.isExpanded = true;
        },
    },
});


// Export the actions
export const { toggleExpansion, expand } = sidebarSlice.actions;

// Export the reducer
export default sidebarSlice.reducer;
