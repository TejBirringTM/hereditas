# User's Guide

Tapestry•Family is a tool to generate and share interactive visualisations of family trees.

To use, simply enter genealogical data using the syntax detailed below and click [Visualise].

For more information about Tapestry•Family, [click here.](/about/what-is-tapestry•family)

## Basic Usage

1. Visit [The Atelier.](/)

2. Enter genealogical data in the text box.

3. Click the [Visualise] button.

4. Like what you see? Generate a *share link* by clicking on the [Share] button.
   
   Aside from sharing your visualisation with others, you can also use the share link to continue working on the same family tree later.
   Simply store the share link in a safe location (such as a note-taking application).

   To return to editing genealogical data *after* a visualisation has been generated, click the [Reset] button followed by the [Visualisation only] option from the drop-down menu.

5. Want to start afresh? Click the [Reset] button followed by the [Everything] option from the drop-down menu.

## Syntax

A family tree is described using line-by-line declarations.

It is important that each declaration listed below is on a separate line. Some declarations may contain *in-line declarations.*

All possible declarations are described below.

As Tapestry•Family continues to grow, more declarations will be added to ensure that the greatest amount of geneological data can be captured and visualised. To stay up to date, make sure to check this section regularly.

### Declaring People

#### Male Individuals

To declare a male individual, use the following template:

`[<key>: "<name>"]`

In later declarations, the declared male may be referenced using: `[<key>]`

###### Remember:

* _Male declarations use square brackets._
* _In declarations or references pertaining to individuals, the `<key>` __can not__ be padded with any spaces._

#### Female Individuals

To declare a female individual, use the following template:

`(<key>: "<name>")`

In later declarations, the declared female may be referenced using: `(<key>)`

###### Remember:

* _Female declarations use round brackets._
* _In declarations or references pertaining to individuals, the `<key>` __can not__ be padded with any spaces._

### Declaring Relationships

#### Spousal Relationships

##### Marriages

To declare a marital relationship, use the following template in between a reference (or in-line declaration) for the groom and a reference (or in-line declaration) for the bride:

`-{mrg:<key>}-`

It does not matter who is referenced (or in-line declared) first, it may be the groom _or_ the bride.

In later declarations, the declared marriage may be referenced using: `{mrg:<key>}`

###### Remember:

* _Relationship declarations use curly brackets._
* _Marriage declarations use keys that are prefixed with `mrg`._
* _In declarations pertaining to relationships, the `<key>` (inclusive of the prefix) __can__ be padded with any number of spaces._
* _In references pertaining to relationships, the `<key>` (inclusive of the prefix) __can not__ be padded with any spaces._
* _Relationship declarations __can__ use any number of dashes (`-`) to represent connecting lines._
* _Relationship declarations __can__ be padded with any number of spaces before the starting dash (`-`)._
* _Relationship declarations __can__ be padded with any number of spaces after the ending dash (`-`)._

#### Successor Relationships

##### Progeny

To declare issue from a couple, use the following template in between a reference to the spousal relationship representing the progenitors (such as a marriage), and a reference (or in-line declaration) for a person as progeny:

`-{dsc:<key>}->`

A progenitor-progeny relationship must always begins with a reference to the spousal relationship representing the progenitors.

In later declarations, the declared progenitor-progeny relationship may be referenced using: `{dsc:<key>}`

###### Remember:

* _Relationship declarations use curly brackets._
* _Progenitor-progeny declarations use keys that are prefixed with `desc`._
* _In declarations pertaining to relationships, the `<key>` (inclusive of the prefix) __can__ be padded with any number of spaces._
* _In references pertaining to relationships, the `<key>` (inclusive of the prefix) __can not__ be padded with any spaces._
* _Relationship declarations __can__ use any number of dashes (`-`) to represent connecting lines._
* _Relationship declarations __can__ be padded with any number of spaces before the starting dash (`-`)._
* _Relationship declarations __can__ be padded with any number of spaces after the ending chevron (`>`)._

##### Adopted Heirs

To declare an heir by adoption, use the following template in between a reference to either an individual adopter or a spousal relationship representing a couple as the joint adopters, and a reference (or in-line declaration) for a person as the adoptee:

`-{adp:<key>}->`

An adopter-adoptee relationship must always begins with a reference to the individual adopter/testator _or_ a reference to the spousal relationship representing the couple as the joint adopters/testators.

In later declarations, the declared adopter-adoptee relationship may be referenced using: `{adp:<key>}`

###### Remember:

* _Relationship declarations use curly brackets._
* _Adopter-adoptee declarations use keys that are prefixed with `adp`._
* _In declarations pertaining to relationships, the `<key>` (inclusive of the prefix) __can__ be padded with any number of spaces._
* _In references pertaining to relationships, the `<key>` (inclusive of the prefix) __can not__ be padded with any spaces._
* _Relationship declarations __can__ use any number of dashes (`-`) to represent connecting lines._
* _Relationship declarations __can__ be padded with any number of spaces before the starting dash (`-`)._
* _Relationship declarations __can__ be padded with any number of spaces after the ending chevron (`>`)._
