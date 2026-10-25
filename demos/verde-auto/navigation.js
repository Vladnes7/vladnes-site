// Cross-document transitions can be cancelled by browser history, background tabs,
// or a second navigation. Cancellation is expected; normal links keep working.
for (const name of ['pageswap','pagereveal']) {
  addEventListener(name,event=>{
    const transition=event.viewTransition;
    if(!transition)return;
    transition.ready.catch(()=>{});
    transition.finished.catch(()=>{});
  });
}
