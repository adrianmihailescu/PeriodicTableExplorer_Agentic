async function request(path, options) {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `The element service returned ${response.status}.`);
  }
  return response.json();
}

export function getElements() {
  return request("/elements");
}

export function getElement(atomicNumber) {
  return request(`/elements/${atomicNumber}`);
}

export function getElementResearch(atomicNumber, signal) {
  return request(`/elements/${atomicNumber}/research`, { signal });
}
