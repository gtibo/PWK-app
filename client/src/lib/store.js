import {
  writable
} from 'svelte/store';

function createScan() {
  const {
    subscribe,
    set,
    update
  } = writable(null);

  return {
    subscribe,
    close: () => {
      return set(null);
    },
    launch: (confirmScanFunc) => {
      return set({
        confirmScanFunc: confirmScanFunc
      });
    }
  };
}

function createPagination() {
	const { subscribe, set, update } = writable({path:"", params:{}});

	return {
		subscribe,
		setPage: (page_path, params = {}) => set({
      path: page_path,
      params: params
    })
	};
}

export const scanning = createScan();
export const pagination = createPagination();
