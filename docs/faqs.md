# Frequently Asked Questions

If you are having trouble with Normalizr, try [StackOverflow](http://stackoverflow.com/questions/tagged/normalizr). There is a larger community there that will help you solve issues a lot quicker than opening an Issue on the Normalizr GitHub page.

## How do I *denormalize* entities?

This is entirely up to you. Normalizr does not include any logic to reverse the normalization because this process will be very heavily dependent on how and with what you store your data.

## Will you accept a Pull Request that adds a *denormalize* function?

Probably not. Unless you can show that it's flexible enough to work with everyone's data in every system, be it Redux, Flux, MobX, and anything else, it's just not going to be useful enough to justify the additional bloat to Normalizr.
