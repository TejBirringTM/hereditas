# The Codex Notation

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Syntax](#basic-syntax)
3. [Declaring Individuals](#declaring-individuals)
4. [Relationships](#relationships)
5. [Additional Information](#additional-information)
6. [Document Structure](#document-structure)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Error Prevention](#error-prevention)
10. [Advanced Usage](#advanced-usage)

## Introduction

The Codex Notation is Hereditas' precise language for recording family relationships. It combines mathematical rigor with intuitive readability, allowing complex family trees to be documented with accuracy while remaining accessible.

### Key Features

- Line-based declarations
- Distinct notation for males and females
- Clear relationship markers:
  - marriages
  - progeny (from marriage)
  - adoptions (from marriage, or from individual)
- Flexible text annotation system

## Basic Syntax

### Core Rules

1. Each major declaration must be on its own line
2. Declarations can contain in-line declarations
3. All keys must start with a letter or non-zero digit
4. Keys can contain letters, digits, and periods

### Declaration Types

- Person declarations (male/female)
- Relationship declarations (marriage/progeny/adoption)
- Start declarations
- Text appendments
- Comments

## Declaring Individuals

### Male Declarations

```text
[key: "name"]    /* Declaration */
[key]            /* Reference to the existing declaration 'key' */

Examples:
[augustus: "Augustus Caesar"]
[tiberius.son: "Tiberius Julius Caesar"]
```

#### Rules for Males

- Uses square brackets `[]`
- No spaces in keys
- Names must be in quotes
- References use only the key

### Female Declarations

```text
(key: "name")    /* Declaration */
(key)            /* Reference */

Examples:
(livia: "Livia Drusilla")
(julia.major: "Julia the Elder")
```

#### Rules for Females

- Uses round brackets `()`
- No spaces in keys
- Names must be in quotes
- References use only the key

## Relationships

### Marriage Declarations

```text
/* Basic form */
[male] ---{mrg}--- (female)

/* With specific key, if it needs to be referenced later */
[male] ---{mrg:key}--- (female)

/* Reference */
{mrg:key}
```

#### Marriage Rules

- Direction doesn't matter (bride/groom order is flexible)
- Can use multiple dashes for visual clarity
- Spaces allowed around relationship markers
- Keys must be prefixed with `mrg:`

### Progeny Declarations

```text
/* Basic form */
{mrg:parents} --{dsc}--> [child]

/* With specific key, if descent needs to be referenced */
{mrg:parents} --{dsc:heir1}--> [child]

/* Reference */
{dsc:heir1}
```

#### Progeny Rules

- Must start from a marriage reference
- Arrow indicates direction (parent to child)
- Keys must be prefixed with `dsc:`

### Adoption Declarations

```text
/* From individual */
[adopter] --{adp}--> [adoptee]

/* From couple */
{mrg:couple} --{adp}--> [adoptee]

/* With specific key */
[adopter] --{adp:succession1}--> [adoptee]

/* Reference */
{adp:succession1}
```

#### Adoption Rules

- Can start from individual *or* marriage reference
- Arrow indicates direction (adopter to adoptee)
- Keys must be prefixed with `adp:`

## Additional Information

### Start Declarations

A start declaration is mandatory. This declaration is used to indicate the root ancestor (i.e. the first recorded ancestor) of the primary line of descent for visualisation.

```text
START WITH [augustus: "Augustus Caesar"]
```

- Required at beginning of document
- Only one per document
- Establishes root of primary family tree

### Biographical Information

This declaration is used to append textual information to a reference.

```text
APPEND [augustus]:
Born 63 BCE in Rome
Became Princeps in 27 BCE
Died 14 CE at Nola

APPEND {mrg:imperial1}:
Marriage celebrated in 38 BCE
Political alliance
```

### Comments

The purpose of comments is to make a codex readable.

```text
/* This is a single-line comment */
```

**Note:** Currently, multi-line comments are not supported.

## Document Structure

The following example depicts the structure for a typical codex:

```text
START WITH [augustus: "Augustus"]

/* Marriage with in-line declarations */
[augustus: "Augustus"] ---{mrg:imp1}--- (livia: "Livia")

/* Child declaration */
{mrg:imp1} --{dsc:heir1}--> [tiberius: "Tiberius"]

/* Adoption */
[augustus] --{adp:succession1}--> [tiberius]

/* Biographical information */
APPEND [augustus]:
Details about Augustus
More details
```

## Best Practices

### Naming Conventions

- Use consistent key patterns:

  ```text
  [augustus.heir1: "Gaius Caesar"]
  [augustus.heir2: "Lucius Caesar"]
  ```

- Use meaningful relationship keys:

  ```text
  [antoninus] ---{mrg:ant.first}--- (faustina1)
  [antoninus] ---{mrg:ant.second}--- (faustina2)
  ```

### Organisation

1. Start with root declaration
2. Group marriages by generation
3. Declare children after parents
4. Use comments to separate branches

## Common Patterns

### Multiple Marriages

```text
[claudius] ---{mrg:cl.first}--- (messalina)
[claudius] ---{mrg:cl.second}--- (agrippina)

{mrg:cl.first} --{dsc:cl.heir1}--> [britannicus]
{mrg:cl.second} --{dsc:cl.heir2}--> [nero]
```

### Adoption Chains

```text
[caesar] --{adp:jul.succession1}--> [augustus]
[augustus] --{adp:jul.succession2}--> [tiberius]
```

## Error Prevention

### Common Mistakes

- Missing start declaration
- Inconsistent key references
- Unclosed brackets/quotes
- Missing marriage declarations before progeny
- Incorrect spacing in references

### Best Practices for Error Prevention

- Review all keys for consistency
- Ensure each relationship reference exists
- Match brackets
- Verify all referenced persons are declared
- Test spacing in references

## Advanced Usage

### Extended Character Support

- Support for diacritical marks:
  
  ā, ē, ī, ō, ū, ṅ, ṭ, ḍ, ṛ

### Complex Structures

- Multiple adoptions
- Cross-generation marriages
- Parallel family lines
- Historical annotations
- Multiple patrilineages in one family tree
