# Chisel

A coding agent I am writing for myself. 
This is *personal* software, so if you request a feature I might not get to it.



# Ideas

- I want every single network request (and response) to be logged. (see Auditable)[#Auditable]
- As well as any action the agent takes (file access, tool call, etc.) (see Auditable)[#Auditable]



#### Auditable

As a general rule, anything the agent does will be written to an append only log.
This Includes 

- Network
- Disc access (read, and any edits to any files)
- Tool calls
- Anything else I did not think of

The general goal is to not be surprised if the agent is doing something.

