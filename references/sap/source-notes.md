# SAP Source Notes

This project deliberately separates stable classic HCM source knowledge from release-specific source structures.

Known classic infotype/table anchors used as conceptual mapping points include PA0000, PA0001, PA0002, PA0006, PA0021, PA0022, PA0024, PA0007, PA0008, PA0014, PA0015, PA0045, PA2001, PA2002, PA2005, PA2006, and PA2007; OM object data uses HRP1000/HRP1001 as baseline object/relationship anchors.

The project must validate exact fields against the target S/4HANA HCM system DDIC/API before production use. This is especially important for Payroll results, Training & Event Management, and Talent & Performance Management where storage or APIs can be product/release/implementation dependent.

References used to define the Agent Skill packaging:
- https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx
- https://github.com/agentskills/agentskills/blob/main/docs/skill-creation/best-practices.mdx
- https://github.com/agentskills/agentskills/blob/main/docs/skill-creation/evaluating-skills.mdx
